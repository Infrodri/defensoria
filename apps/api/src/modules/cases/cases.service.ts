import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { Prisma } from '@defensoria/db';
import { CaseType, Role, RoleInCase, Phase, InterventionPath, RiskLevel } from '@defensoria/shared';
import { AssignTeamDto } from './dto/assign-team.dto';
import { CreateCaseDto } from './dto/create-case.dto';

export interface TransferOfficeDto {
  targetOfficeId: string;
  reason: string;
}

export interface UpdatePathDto {
  path: InterventionPath;
  reason: string;
}

@Injectable()
export class CasesService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  /**
   * Genera el caseCode con formato `DNA-{año}-{secuencia 4 dígitos}`.
   * FIX 6 (Fase 0): usa la secuencia PostgreSQL `case_code_seq` (nextval),
   * que es atómica por construcción — elimina la condición de carrera del
   * patrón anterior (findFirst + insert con caseCode @unique). El valor se
   * consume aunque la transacción haga rollback (secuencia no transaccional),
   * lo que es aceptable: solo produce saltos de numeración, nunca colisiones.
   */
  private async generateCaseCode(
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `DNA-${year}-`;

    const [row] = await client.$queryRaw<{ nextval: number }[]>`
      SELECT nextval('"case_code_seq"')::int AS nextval
    `;
    const seq = Number(row.nextval);
    const paddedSeq = seq.toString().padStart(4, '0');
    return `${prefix}${paddedSeq}`;
  }

  async create(dto: CreateCaseDto, userId: string, officeId: string) {
    // Verify NNA exists
    const nna = await this.prisma.person.findUnique({ where: { id: dto.nnaId } });
    if (!nna) {
      throw new BadRequestException('El NNA titular no existe');
    }

    return this.prisma.$transaction(async (tx) => {
      // 0. Generar caseCode DENTRO de la transacción (secuencia atómica)
      const caseCode = await this.generateCaseCode(tx);

      // 1. Create Case
      const newCase = await tx.case.create({
        data: {
          caseCode,
          caseType: dto.caseType,
          currentPhase: Phase.DERIVACION,
          currentInterventionPath: InterventionPath.GESTION_ADMINISTRATIVA,
          intakeNarrative: dto.intakeNarrative || '',
          currentOfficeId: officeId,
          createdBy: userId,
          // Denunciante tercero
          isThirdPartyComplainant: dto.isThirdPartyComplainant || false,
          complainantFullName: dto.complainantFullName || null,
          complainantDocumentId: dto.complainantDocumentId || null,
          complainantRelation: dto.complainantRelation || null,
          complainantPhone: dto.complainantPhone || null,
          complainantAddress: dto.complainantAddress || null,
          // Datos demográficos NNA
          nnaBirthDate: dto.nnaBirthDate ? new Date(dto.nnaBirthDate) : null,
          nnaGender: dto.nnaGender ? (dto.nnaGender as any) : null,
          nnaCity: dto.nnaCity || null,
          nnaPhone: dto.nnaPhone || null,
          nnaAddress: dto.nnaAddress || null,
        },
      });

      // 2. Add NNA as primary party
      await tx.caseParty.create({
        data: {
          caseId: newCase.id,
          personId: dto.nnaId,
          roleInCase: RoleInCase.NNA,
          isPrimary: true,
          createdBy: userId,
        },
      });

      // 3. Add Complainant if present
      if (dto.complainantId) {
        await tx.caseParty.create({
          data: {
            caseId: newCase.id,
            personId: dto.complainantId,
            roleInCase: RoleInCase.DENUNCIANTE,
            isPrimary: false,
            createdBy: userId,
          },
        });
      }

      // 4. Add Accused if present
      if (dto.accusedId) {
        await tx.caseParty.create({
          data: {
            caseId: newCase.id,
            personId: dto.accusedId,
            roleInCase: RoleInCase.DENUNCIADO,
            isPrimary: false,
            createdBy: userId,
          },
        });
      }

      // 5. Create initial office history
      await tx.caseOfficeHistory.create({
        data: {
          caseId: newCase.id,
          officeId,
          reason: 'Apertura inicial del expediente',
          transferredBy: userId,
        },
      });

      // 6. Create initial path history
      await tx.interventionPathHistory.create({
        data: {
          caseId: newCase.id,
          path: InterventionPath.GESTION_ADMINISTRATIVA,
          reason: 'Inicio en Gestión Administrativa Directa',
          changedBy: userId,
        },
      });

      // 7. Registro automático de apertura en bitácora
      await tx.actionLog.create({
        data: {
          caseId: newCase.id,
          authorId: userId,
          actionType: 'OTRO',
          title: '📂 Apertura del Expediente',
          content: `Expediente ${caseCode} creado y registrado en el sistema. Tipo de caso: ${dto.caseType}. Fase inicial: Derivación / Recepción. Vía de intervención: Gestión Administrativa.`,
          isSigned: true,
          signedAt: new Date(),
        },
      });

      return newCase;
    });
  }

  async findAll(user: { id: string; role: Role; officeId: string | null }) {
    const whereClause: any = {
      isDisabled: false, // NUEVO: Solo mostrar expedientes habilitados
    };

    // Administrador sees all cases across all offices
    if (user.role === Role.ADMINISTRADOR) {
      return this.prisma.case.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          parties: {
            include: { person: true },
          },
          currentOffice: true,
          teamHistory: {
            where: { endDate: null },
            include: {
              user: { select: { id: true, firstName: true, lastName: true, role: true } },
            },
          },
        },
      });
    }

    // Jefatura & Secretaria see all cases in their specific office
    if (user.role === Role.JEFATURA || user.role === Role.SECRETARIA) {
      whereClause.currentOfficeId = user.officeId;
      
      return this.prisma.case.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          parties: {
            include: { person: true },
          },
          currentOffice: true,
          teamHistory: {
            where: { endDate: null },
            include: {
              user: { select: { id: true, firstName: true, lastName: true, role: true } },
            },
          },
        },
      });
    }

    // Professionals (Abogado, Psicologo, Social) see cases assigned to them (active only)
    whereClause.teamHistory = {
      some: {
        userId: user.id,
        endDate: null,
      },
    };

    return this.prisma.case.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        parties: {
          include: {
            person: true,
          },
        },
        currentOffice: true,
        teamHistory: {
          where: { endDate: null },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, role: true },
            },
          },
        },
      },
    });
  }

  async findOne(id: string, user: any) {
    await this.caseAccessService.assertUserHasAccess(id, user);

    const caseData = await this.prisma.case.findUnique({
      where: { id },
      include: {
        parties: {
          include: { person: true },
        },
        currentOffice: true,
        teamHistory: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, role: true, email: true } },
            assigner: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { startDate: 'desc' },
        },
        officeHistory: {
          include: {
            office: true,
            transferrer: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { startDate: 'desc' },
        },
        pathHistory: {
          include: {
            changer: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { startDate: 'desc' },
        },
        actionLogs: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!caseData) {
      throw new NotFoundException('Expediente no encontrado');
    }

    return caseData;
  }

  async assignTeam(caseId: string, dto: AssignTeamDto, assignedByUserId: string) {
    const existingCase = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!existingCase) {
      throw new NotFoundException('Expediente no encontrado');
    }

    return this.prisma.$transaction(async (tx) => {
      // FIX 2 (Fase 0): validar que el usuario destino tenga REALMENTE el rol
      // solicitado. Antes el DTO aceptaba cualquier Role para cualquier userId.
      const targetUser = await tx.user.findUnique({
        where: { id: dto.userId },
        select: { role: true },
      });
      if (!targetUser) {
        throw new NotFoundException('Profesional destino no encontrado');
      }

      // Solo roles profesionales pueden asignarse al equipo de un caso
      const assignableRoles: Role[] = [Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL];
      if (!assignableRoles.includes(dto.role)) {
        throw new BadRequestException(
          'El rol asignado debe ser ABOGADO, PSICOLOGO o SOCIAL',
        );
      }

      if (targetUser.role !== dto.role) {
        throw new BadRequestException(
          `El profesional seleccionado no tiene el rol ${dto.role}; su rol real es ${targetUser.role}`,
        );
      }

      // FIX 1 (Fase 0): cerrar filas activas previas para (caseId, role) antes
      // de crear la nueva — garantiza una única asignación activa por caso+rol
      await tx.caseTeamHistory.updateMany({
        where: {
          caseId,
          role: dto.role,
          endDate: null,
        },
        data: {
          endDate: new Date(),
        },
      });

      // Create new assignment entry
      return tx.caseTeamHistory.create({
        data: {
          caseId,
          userId: dto.userId,
          role: dto.role,
          reason: dto.reason,
          assignedBy: assignedByUserId,
        },
      });
    });
  }

  async generateAccessPin(caseId: string) {
    const caseItem = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!caseItem) {
      throw new NotFoundException('Expediente no encontrado');
    }

    const rawPin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinHash = await bcrypt.hash(rawPin, 10);

    await this.prisma.case.update({
      where: { id: caseId },
      data: { accessPinHash: pinHash },
    });

    return {
      pin: rawPin,
      caseCode: caseItem.caseCode,
    };
  }

  async getAnalytics() {
    const totalCases = await this.prisma.case.count();
    
    const byPath = await this.prisma.case.groupBy({
      by: ['currentInterventionPath'],
      _count: { _all: true },
    });

    const byRisk = await this.prisma.case.groupBy({
      by: ['riskLevel'],
      _count: { _all: true },
    });

    const byType = await this.prisma.case.groupBy({
      by: ['caseType'],
      _count: { _all: true },
    });

    const byPhase = await this.prisma.case.groupBy({
      by: ['currentPhase'],
      _count: { _all: true },
    });

    return {
      totalCases,
      byInterventionPath: byPath.map(p => ({ name: p.currentInterventionPath, count: p._count._all })),
      byRiskLevel: byRisk.map(r => ({ name: r.riskLevel || 'SIN_EVALUAR', count: r._count._all })),
      byCaseType: byType.map(t => ({ name: t.caseType, count: t._count._all })),
      byPhase: byPhase.map(ph => ({ name: ph.currentPhase, count: ph._count._all })),
    };
  }

  async massTransfer(dto: { fromUserId: string; toUserId: string; reason: string }, assignedByUserId: string) {
    const fromUser = await this.prisma.user.findUnique({ where: { id: dto.fromUserId } });
    const toUser = await this.prisma.user.findUnique({ where: { id: dto.toUserId } });

    if (!fromUser || !toUser) {
      throw new NotFoundException('Usuario origen o destino no encontrado');
    }

    if (fromUser.role !== toUser.role) {
      throw new BadRequestException('Solo se pueden transferir casos entre profesionales del mismo rol');
    }

    // Find all active assignments for fromUser
    const activeAssignments = await this.prisma.caseTeamHistory.findMany({
      where: {
        userId: dto.fromUserId,
        endDate: null,
      },
      select: { caseId: true, role: true },
    });

    if (activeAssignments.length === 0) {
      return { success: true, message: 'No hay expedientes activos para transferir', transferredCount: 0 };
    }

    return this.prisma.$transaction(async (tx) => {
      // FIX 1 (Fase 0): cerrar TODAS las filas activas de los (caseId, role) que
      // se van a transferir, sin importar el usuario. Esto cierra las del usuario
      // origen y también cualquier activa del destino/otros, evitando que una misma
      // transferencia (o una actividad previa) deje una fila activa duplicada.
      await tx.caseTeamHistory.updateMany({
        where: {
          endDate: null,
          OR: activeAssignments.map((a) => ({ caseId: a.caseId, role: a.role })),
        },
        data: {
          endDate: new Date(),
        },
      });

      // 2. Create new assignments for toUser
      const newAssignments = activeAssignments.map((assignment) => ({
        caseId: assignment.caseId,
        userId: dto.toUserId,
        role: assignment.role,
        reason: dto.reason || 'Transferencia masiva administrativa',
        assignedBy: assignedByUserId,
      }));

      await tx.caseTeamHistory.createMany({
        data: newAssignments,
      });

      return {
        success: true,
        message: 'Transferencia masiva completada',
        transferredCount: newAssignments.length,
      };
    });
  }

  // NUEVO: Sistema de inhabilitación inmutable
  async disableCase(caseId: string, reason: string, disabledByUserId: string) {
    const existingCase = await this.prisma.case.findUnique({ 
      where: { id: caseId },
      include: { creator: true, currentOffice: true }
    });
    
    if (!existingCase) {
      throw new NotFoundException('Expediente no encontrado');
    }

    if (existingCase.isDisabled) {
      throw new BadRequestException('El expediente ya está inhabilitado');
    }

    if (existingCase.isClosed) {
      throw new BadRequestException('No se puede inhabilitar un expediente cerrado');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create disability report
      const disabilityReport = await tx.disabilityReport.create({
        data: {
          caseId,
          caseCode: existingCase.caseCode,
          reason,
          disabledBy: disabledByUserId,
        },
      });

      // 2. Update case status
      const disabledCase = await tx.case.update({
        where: { id: caseId },
        data: {
          isDisabled: true,
          disabledAt: new Date(),
          disabledBy: disabledByUserId,
          disabledReason: reason,
          disabledReportId: disabilityReport.id,
        },
      });

      // 3. Create audit log
      await tx.actionLog.create({
        data: {
          caseId,
          authorId: disabledByUserId,
          actionType: 'OTRO',
          title: '🚫 Expediente Inhabilitado por Secretaría',
          content: `El expediente ${existingCase.caseCode} ha sido inhabilitado. Motivo: ${reason}. Esta acción genera un reporte automático para revisión de Jefatura.`,
          isSigned: true,
          signedAt: new Date(),
        },
      });

      return {
        case: disabledCase,
        report: disabilityReport,
        message: 'Expediente inhabilitado exitosamente. Se generó reporte automático para Jefatura.',
      };
    });
  }

  async getDisabilityReports(user: any) {
    // Solo Jefatura y Administradores pueden ver reportes
    if (user.role !== 'JEFATURA' && user.role !== 'ADMINISTRADOR') {
      throw new BadRequestException('Sin permisos para ver reportes de inhabilitación');
    }

    const whereClause: any = {};
    
    // Jefatura solo ve reportes de su oficina
    if (user.role === 'JEFATURA' && user.officeId) {
      whereClause.case = {
        currentOfficeId: user.officeId,
      };
    }

    return this.prisma.disabilityReport.findMany({
      where: whereClause,
      include: {
        case: {
          select: {
            id: true,
            caseCode: true,
            caseType: true,
            currentPhase: true,
            currentOffice: { select: { name: true, code: true } },
            parties: {
              where: { isPrimary: true },
              include: { person: { select: { firstName: true, lastName: true } } },
            },
          },
        },
        disabler: {
          select: { firstName: true, lastName: true, role: true },
        },
        reviewer: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
      orderBy: { disabledAt: 'desc' },
    });
  }

  async reviewDisabilityReport(reportId: string, reviewedByUserId: string, status: 'APPROVED' | 'REJECTED') {
    const report = await this.prisma.disabilityReport.findUnique({ 
      where: { id: reportId },
      include: { case: true }
    });
    
    if (!report) {
      throw new NotFoundException('Reporte de inhabilitación no encontrado');
    }

    return this.prisma.disabilityReport.update({
      where: { id: reportId },
      data: {
        status,
        reviewedBy: reviewedByUserId,
        reviewedAt: new Date(),
      },
    });
  }

  /**
   * Obtiene el registro consolidado del expediente (Fase 1).
   * Agrega en una sola respuesta: caso, ficha social, informes, conciliación,
   * inspecciones, evidencias y 8 análisis de IA.
   * Usa $transaction para consistencia de lectura.
   */
  async getRecord(caseId: string, user: any) {
    // Validar acceso antes de consultar (CaseAccessGuard ya lo hace, pero doble check)
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    return this.prisma.$transaction(async (tx) => {
      // 1. Caso base
      const caseData = await tx.case.findUnique({
        where: { id: caseId },
        include: {
          parties: {
            include: { person: true },
          },
          currentOffice: true,
        },
      });

      if (!caseData) {
        throw new NotFoundException('Expediente no encontrado');
      }

      // 2. Ficha social
      const socialIntake = await tx.socialIntakeForm.findUnique({
        where: { caseId },
        include: {
          socialWorker: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      // 3. Informes (append-only, versionados)
      const reports = await tx.report.findMany({
        where: { caseId },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, role: true } },
          parentReport: { select: { id: true, title: true, version: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // 4. Conciliación
      const evaluation = await tx.conciliationEvaluation.findUnique({
        where: { caseId },
        include: {
          evaluator: { select: { id: true, firstName: true, lastName: true } },
        },
      });
      const processes = await tx.conciliationProcess.findMany({
        where: { caseId },
        include: {
          leadLawyer: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { scheduledDate: 'desc' },
      });
      const conciliation = { evaluation, processes };

      // 5. Inspecciones (con findings + evidenceFiles)
      const inspections = await tx.inspection.findMany({
        where: { caseId },
        include: {
          establishment: true,
          inspector: true,
          location: true,
          findings: true,
          evidenceFiles: true,
        },
        orderBy: { scheduledAt: 'desc' },
      });

      // 6. Evidencias (con fileHash)
      const evidences = await tx.evidence.findMany({
        where: { caseId },
        include: {
          uploader: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // 7. Análisis de IA (8 tipos)
      const [
        discrepancies,
        penalTypicity,
        riskScales,
        clinicalTranslations,
        trauma,
        environmental,
        transversalTimeline,
        transversalAnonymized,
      ] = await Promise.all([
        tx.discrepancyAnalysis.findMany({
          where: { caseId },
          orderBy: { analyzedAt: 'desc' },
        }),
        tx.penalTypicityAnalysis.findMany({
          where: { caseId },
          orderBy: { analyzedAt: 'desc' },
        }),
        tx.riskScaleAnalysis.findMany({
          where: { caseId },
          orderBy: { analyzedAt: 'desc' },
        }),
        tx.clinicalTranslation.findMany({
          where: { caseId },
          orderBy: { createdAt: 'desc' },
        }),
        tx.traumaAnalysis.findMany({
          where: { caseId },
          orderBy: { analyzedAt: 'desc' },
        }),
        tx.environmentalMapping.findMany({
          where: { caseId },
          orderBy: { analyzedAt: 'desc' },
        }),
        tx.transversalUnifiedTimeline.findMany({
          where: { caseId },
          orderBy: { createdAt: 'desc' },
        }),
        tx.transversalAnonymizedReport.findMany({
          where: { caseId },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const aiAnalyses = {
        discrepancies,
        penalTypicity,
        riskScales,
        clinicalTranslations,
        trauma,
        environmental,
        transversalTimeline,
        transversalAnonymized,
      };

      return {
        case: {
          id: caseData.id,
          caseCode: caseData.caseCode,
          caseType: caseData.caseType,
          currentPhase: caseData.currentPhase,
          currentInterventionPath: caseData.currentInterventionPath,
          riskLevel: caseData.riskLevel,
          intakeNarrative: caseData.intakeNarrative,
          isDisabled: caseData.isDisabled,
          isClosed: caseData.isClosed,
          currentOffice: caseData.currentOffice,
          parties: caseData.parties,
        },
        socialIntake,
        reports,
        conciliation,
        inspections,
        evidences,
        aiAnalyses,
      };
    });
  }

  async updateRequiredSessions(caseId: string, userId: string, requiredSessions: number) {
    if (requiredSessions < 1) {
      throw new BadRequestException('El número de sesiones requeridas debe ser al menos 1');
    }

    const activeAssignment = await this.prisma.caseTeamHistory.findFirst({
      where: {
        caseId,
        userId,
        endDate: null,
      },
    });

    if (!activeAssignment) {
      throw new NotFoundException('No tenés una asignación activa en este expediente');
    }

    const isFinished = activeAssignment.completedSessions >= requiredSessions;

    return this.prisma.caseTeamHistory.update({
      where: { id: activeAssignment.id },
      data: {
        requiredSessions,
        isInterventionFinished: isFinished,
      },
    });
  }

  async getInterventionStatus(caseId: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, caseCode: true, currentPhase: true, isClosed: true },
    });

    if (!caseData) {
      throw new NotFoundException('Expediente no encontrado');
    }

    const activeTeam = await this.prisma.caseTeamHistory.findMany({
      where: {
        caseId,
        endDate: null,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });

    const isAllFinished = activeTeam.length > 0 && activeTeam.every((m) => m.isInterventionFinished);

    return {
      caseId: caseData.id,
      caseCode: caseData.caseCode,
      currentPhase: caseData.currentPhase,
      isClosed: caseData.isClosed,
      isAllInterventionsFinished: isAllFinished,
      teamMembers: activeTeam.map((member) => ({
        id: member.id,
        userId: member.userId,
        professionalName: `${member.user.firstName} ${member.user.lastName}`,
        role: member.role,
        requiredSessions: member.requiredSessions,
        completedSessions: member.completedSessions,
        isInterventionFinished: member.isInterventionFinished,
      })),
    };
  }

  /**
   * Advance the case phase automatically when requirements are met.
   * Rules:
   *   DERIVACION → EVALUACION: when the first professional is assigned to the team
   *   EVALUACION → SEGUIMIENTO: when all active professionals have at least 1 initial report
   * Only advances if the current phase is exactly the expected previous phase.
   */
  async advancePhaseIfReady(caseId: string, changedBy: string): Promise<void> {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      select: { currentPhase: true, isClosed: true },
    });

    if (!caseData || caseData.isClosed) return;

    const currentPhase = caseData.currentPhase;
    let nextPhase: string | null = null;
    let reason = '';

    if (currentPhase === 'DERIVACION') {
      // Verify at least 1 active professional
      const activeTeam = await this.prisma.caseTeamHistory.count({
        where: { caseId, endDate: null },
      });
      if (activeTeam > 0) {
        nextPhase = 'EVALUACION';
        reason = 'Equipo interdisciplinario asignado — caso pasa a Evaluación';
      }
    } else if (currentPhase === 'EVALUACION') {
      // Verify all active professionals have at least 1 report
      const activeTeam = await this.prisma.caseTeamHistory.findMany({
        where: { caseId, endDate: null },
        select: { userId: true, role: true },
      });

      if (activeTeam.length > 0) {
        const REPORT_TYPES_BY_ROLE: Record<string, string[]> = {
          ABOGADO:   ['INFORME_JURIDICO'],
          PSICOLOGO: ['INFORME_PSICOLOGICO', 'INFORME_PSICOSOCIAL'],
          SOCIAL:    ['INFORME_SOCIAL', 'INFORME_PSICOSOCIAL'],
        };

        const allHaveReport = await Promise.all(
          activeTeam.map(async (member) => {
            const allowedCategories = REPORT_TYPES_BY_ROLE[member.role] ?? [];
            if (allowedCategories.length === 0) return true;
            const count = await this.prisma.report.count({
              where: {
                caseId,
                authorId: member.userId,
                disciplineReportType: { category: { in: allowedCategories as any[] } },
              },
            });
            return count > 0;
          }),
        );

        if (allHaveReport.every(Boolean)) {
          nextPhase = 'SEGUIMIENTO';
          reason = 'Todos los informes iniciales presentados — caso pasa a Seguimiento';
        }
      }
    }

    if (nextPhase) {
      await this.prisma.$transaction(async (tx) => {
        await tx.case.update({
          where: { id: caseId },
          data: { currentPhase: nextPhase as any },
        });
        await tx.actionLog.create({
          data: {
            caseId,
            authorId: changedBy,
            actionType: 'OTRO',
            title: `🔄 Avance de Fase: ${nextPhase}`,
            content: reason,
            isSigned: true,
            signedAt: new Date(),
          },
        });
      });
    }
  }

  /**
   * Procedural timeline of the case — all relevant events ordered by date.
   */
  async getTimeline(caseId: string, user: any) {
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    const [caseData, actionLogs, appointments, reports, evidences] = await Promise.all([
      this.prisma.case.findUnique({ where: { id: caseId }, select: { id: true, createdAt: true, caseCode: true, caseType: true } }),
      this.prisma.actionLog.findMany({ where: { caseId }, include: { author: { select: { id: true, firstName: true, lastName: true, role: true } } }, orderBy: { createdAt: 'asc' } }),
      this.prisma.appointment.findMany({ where: { caseId }, include: { creator: { select: { id: true, firstName: true, lastName: true, role: true } } }, orderBy: { createdAt: 'asc' } }),
      this.prisma.report.findMany({ where: { caseId }, include: { author: { select: { id: true, firstName: true, lastName: true, role: true } }, disciplineReportType: { select: { name: true, category: true } } }, orderBy: { createdAt: 'asc' } }),
      this.prisma.evidence.findMany({ where: { caseId }, include: { uploader: { select: { id: true, firstName: true, lastName: true, role: true } } }, orderBy: { createdAt: 'asc' } }),
    ]);

    const events: any[] = [];

    if (caseData) {
      events.push({
        id: `case-${caseData.id}`,
        type: 'CASE_OPENED',
        title: `Apertura del Expediente ${caseData.caseCode}`,
        description: `Expediente registrado. Tipo: ${caseData.caseType}`,
        date: caseData.createdAt,
      });
    }

    actionLogs.forEach((log) => {
      events.push({
        id: `log-${log.id}`,
        type: 'ACTION_LOG',
        title: log.title,
        description: log.content?.substring(0, 200) ?? '',
        date: log.createdAt,
        user: log.author,
      });
    });

    appointments.forEach((app) => {
      events.push({
        id: `app-${app.id}`,
        type: 'APPOINTMENT',
        title: app.title,
        description: `${app.appointmentType} — Estado: ${app.status}${app.location ? ` · ${app.location}` : ''}`,
        date: app.scheduledAt ?? app.createdAt,
        user: app.creator,
      });
    });

    reports.forEach((rep) => {
      events.push({
        id: `rep-${rep.id}`,
        type: 'REPORT',
        title: rep.title,
        description: `${rep.disciplineReportType?.name ?? rep.disciplineReportType?.category} — Estado: ${rep.status}`,
        date: rep.createdAt,
        user: rep.author,
      });
    });

    evidences.forEach((ev) => {
      events.push({
        id: `ev-${ev.id}`,
        type: 'EVIDENCE',
        title: `Evidencia: ${ev.fileName}`,
        description: `${ev.mimeType} — ${(ev.fileSize / 1024).toFixed(1)} KB${ev.description ? ` · ${ev.description}` : ''}`,
        date: ev.createdAt,
        user: ev.uploader,
      });
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
