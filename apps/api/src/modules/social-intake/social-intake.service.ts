import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Phase } from '@defensoria/shared';

export interface CreateSocialIntakeDto {
  interviewDate: string;
  interviewLocation: string;
  incidentDescription: string;
  incidentLocation: string;
  incidentDate?: string;
  incidentWitnesses?: string;
  familyStructure: string;
  socialEconomicSituation: string;
  immediateDangerAssessment: boolean;
  dangerLevel?: 'BAJO' | 'MEDIO' | 'ALTO';
  professionalObservations: string;
  initialRecommendations: string;
}

@Injectable()
export class SocialIntakeService {
  constructor(private prisma: PrismaService) {}

  async createIntakeForm(caseId: string, userId: string, data: CreateSocialIntakeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== Role.SOCIAL) {
      throw new ForbiddenException('Solo TRABAJADOR SOCIAL puede crear fichas sociales');
    }

    const caso = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!caso) throw new NotFoundException('Caso no encontrado');
    if (caso.currentPhase !== Phase.DERIVACION) {
      throw new ForbiddenException('El caso no está en fase DERIVACION');
    }

    const existing = await this.prisma.socialIntakeForm.findUnique({ where: { caseId } });
    if (existing) throw new ForbiddenException('Ya existe una ficha social para este caso');

    return this.prisma.socialIntakeForm.create({
      data: {
        caseId,
        socialWorkerId: userId,
        interviewDate: new Date(data.interviewDate),
        interviewLocation: data.interviewLocation,
        incidentDescription: data.incidentDescription,
        incidentLocation: data.incidentLocation,
        incidentDate: data.incidentDate ? new Date(data.incidentDate) : null,
        incidentWitnesses: data.incidentWitnesses,
        familyStructure: data.familyStructure,
        socialEconomicSituation: data.socialEconomicSituation,
        immediateDangerAssessment: data.immediateDangerAssessment,
        dangerLevel: data.dangerLevel || null,
        professionalObservations: data.professionalObservations,
        initialRecommendations: data.initialRecommendations,
        isCompleted: false,
      },
    });
  }

  async completeIntakeForm(formId: string, userId: string) {
    const form = await this.prisma.socialIntakeForm.findUnique({
      where: { id: formId },
      include: { case: true },
    });
    if (!form) throw new NotFoundException('Ficha social no encontrada');
    if (form.socialWorkerId !== userId) throw new ForbiddenException('No puedes completar esta ficha');
    if (form.isCompleted) throw new ForbiddenException('Esta ficha ya está completada');

    return this.prisma.$transaction(async (tx) => {
      await tx.socialIntakeForm.update({
        where: { id: formId },
        data: { isCompleted: true, completedAt: new Date() },
      });
      await tx.case.update({
        where: { id: form.caseId },
        data: { currentPhase: Phase.EVALUACION },
      });
      await tx.actionLog.create({
        data: {
          caseId: form.caseId,
          authorId: userId,
          actionType: 'NOTA',
          title: 'Ficha Social Completada',
          content:
            'La ficha social ha sido completada por el Trabajador Social. El caso avanza a fase EVALUACION.',
          isSigned: true,
          signedAt: new Date(),
        },
      });
      return { success: true };
    });
  }

  async getIntakeFormByCaseId(caseId: string) {
    return this.prisma.socialIntakeForm.findUnique({
      where: { caseId },
      include: {
        socialWorker: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}