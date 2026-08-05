import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Phase, CaseType, InterventionPath, ActionType, AppointmentType, AppointmentStatus } from '@defensoria/shared';

export interface ScheduleHearingDto {
  scheduledDate: string;
  location: string;
}

export interface RecordResultDto {
  agreementReached: boolean;
  agreementText?: string;
  topic?: string;
}

@Injectable()
export class ConciliationService {
  constructor(private prisma: PrismaService) {}

  async evaluateConciliability(caseId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== Role.ABOGADO && user.role !== Role.ADMINISTRADOR)) {
      throw new ForbiddenException('Solo un ABOGADO o ADMINISTRADOR puede evaluar la conciliabilidad');
    }

    const caso = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: { actionLogs: true, penalTypicityAnalyses: true },
    });
    if (!caso) throw new NotFoundException('Caso no encontrado');

    const existing = await this.prisma.conciliationEvaluation.findUnique({ where: { caseId } });
    if (existing) throw new ForbiddenException('Ya existe una evaluación de conciliabilidad para este caso');

    const hasMaltrato = caso.caseType === CaseType.DENUNCIA_VULNERACION;
    const hasAuthorityLoss = caso.actionLogs.some((a) =>
      `${a.title} ${a.content}`.toLowerCase().includes('autoridad paterna'),
    );
    const hasCriminalAction = caso.penalTypicityAnalyses.length > 0;
    const isConciliable = !(hasMaltrato || hasAuthorityLoss || hasCriminalAction);
    const reason = isConciliable
      ? 'No se detectan factores de maltrato, pérdida de autoridad paterna ni acción penalizable. El caso es conciliable.'
      : 'Se detectan factores que impiden la conciliación. El caso deriva a VIA_JUDICIAL.';

    return this.prisma.$transaction(async (tx) => {
      await tx.conciliationEvaluation.create({
        data: {
          caseId,
          evaluatedBy: userId,
          isConciliable,
          reason,
          hasMaltrato,
          hasCriminalAction,
          hasAuthorityLoss,
        },
      });

      if (isConciliable) {
        await tx.case.update({ where: { id: caseId }, data: { currentInterventionPath: 'CONCILIACION' } });
        await tx.interventionPathHistory.create({
          data: { caseId, path: 'CONCILIACION', reason, changedBy: userId },
        });
        await tx.actionLog.create({
          data: {
            caseId,
            authorId: userId,
            actionType: 'NOTA',
            title: 'Evaluación de Conciliabilidad',
            content: reason,
          },
        });
      } else {
        await tx.case.update({ where: { id: caseId }, data: { currentInterventionPath: 'VIA_JUDICIAL' } });
        await tx.interventionPathHistory.create({
          data: { caseId, path: 'VIA_JUDICIAL', reason, changedBy: userId },
        });
        await tx.actionLog.create({
          data: {
            caseId,
            authorId: userId,
            actionType: 'OTRO',
            title: 'Caso derivado a VIA_JUDICIAL',
            content: reason,
          },
        });
      }

      return { success: true, isConciliable };
    });
  }

  async scheduleHearing(caseId: string, data: ScheduleHearingDto, userId: string) {
    const evaluation = await this.prisma.conciliationEvaluation.findUnique({ where: { caseId } });
    if (!evaluation) throw new BadRequestException('El caso no tiene evaluación de conciliabilidad');
    if (!evaluation.isConciliable) {
      throw new ForbiddenException('El caso no es conciliable; no se puede programar audiencia');
    }

    const scheduledDate = new Date(data.scheduledDate);

    return this.prisma.$transaction(async (tx) => {
      const process = await tx.conciliationProcess.create({
        data: {
          caseId,
          scheduledDate,
          location: data.location,
          leadLawyerId: userId,
        },
      });

      await tx.appointment.create({
        data: {
          caseId,
          title: 'Audiencia de Conciliación',
          appointmentType: AppointmentType.AUDIENCIA,
          status: AppointmentStatus.PROGRAMADA,
          scheduledAt: scheduledDate,
          location: data.location,
          createdBy: userId,
        },
      });

      await tx.actionLog.create({
        data: {
          caseId,
          authorId: userId,
          actionType: ActionType.AUDIENCIA,
          title: 'Audiencia de Conciliación Programada',
          content: `Audiencia programada para la conciliación del caso.`,
        },
      });

      return process;
    });
  }

  async recordResult(processId: string, data: RecordResultDto, userId: string) {
    const process = await this.prisma.conciliationProcess.findUnique({
      where: { id: processId },
    });
    if (!process) throw new NotFoundException('Proceso de conciliación no encontrado');

    return this.prisma.$transaction(async (tx) => {
      await tx.conciliationProcess.update({
        where: { id: processId },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          agreementReached: data.agreementReached,
          agreementText: data.agreementText ?? null,
        },
      });

      if (data.agreementReached) {
        // GAP Fase 2: persistir el acuerdo en ConciliationAgreement (modelo que
        // existía sin uso). Se crea SOLO si no existe un acuerdo previo para el caso.
        //
        // El CIERRE oficial del expediente NO se duplica aquí: la normativa interna
        // cierra el caso al emitir el INFORME_FINAL_CONCILIACION (reports.service.emit),
        // que fija isClosed=true + currentPhase=CIERRE + path CONCILIACION.
        const existingAgreement = await tx.conciliationAgreement.findUnique({
          where: { caseId: process.caseId },
        });
        if (!existingAgreement) {
          await tx.conciliationAgreement.create({
            data: {
              caseId: process.caseId,
              topic: data.topic ?? 'Acuerdo de Conciliación',
              agreementContent:
                data.agreementText || 'Las partes alcanzaron un acuerdo en la audiencia de conciliación.',
              isSignedByParties: false,
            },
          });
        }

        await tx.actionLog.create({
          data: {
            caseId: process.caseId,
            authorId: userId,
            actionType: ActionType.NOTA,
            title: 'Acuerdo de Conciliación Alcanzado',
            content: data.agreementText || 'Las partes alcanzaron un acuerdo en la audiencia de conciliación.',
            isSigned: true,
            signedAt: new Date(),
          },
        });
      } else {
        await tx.case.update({
          where: { id: process.caseId },
          data: { currentInterventionPath: 'VIA_JUDICIAL' },
        });
        await tx.interventionPathHistory.create({
          data: {
            caseId: process.caseId,
            path: 'VIA_JUDICIAL',
            reason: 'No se alcanzó acuerdo en la conciliación. El caso deriva a VIA_JUDICIAL.',
            changedBy: userId,
          },
        });
        await tx.actionLog.create({
          data: {
            caseId: process.caseId,
            authorId: userId,
            actionType: ActionType.NOTA,
            title: 'Conciliación sin Acuerdo',
            content: 'No se alcanzó acuerdo en la audiencia de conciliación. El caso deriva a VIA_JUDICIAL.',
            isSigned: true,
            signedAt: new Date(),
          },
        });
      }

      return { success: true };
    });
  }

  async getEvaluationByCaseId(caseId: string) {
    return this.prisma.conciliationEvaluation.findUnique({
      where: { caseId },
      include: {
        evaluator: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getProcessesByCaseId(caseId: string) {
    return this.prisma.conciliationProcess.findMany({
      where: { caseId },
      include: {
        leadLawyer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }
}