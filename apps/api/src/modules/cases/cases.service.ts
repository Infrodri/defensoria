import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
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

  private async generateCaseCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `DNA-${year}-`;

    const lastCase = await this.prisma.case.findFirst({
      where: { caseCode: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
      select: { caseCode: true },
    });

    let sequence = 1;
    if (lastCase && lastCase.caseCode) {
      const parts = lastCase.caseCode.split('-');
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    const paddedSeq = sequence.toString().padStart(4, '0');
    return `${prefix}${paddedSeq}`;
  }

  async create(dto: CreateCaseDto, userId: string, officeId: string) {
    const caseCode = await this.generateCaseCode();

    // Verify NNA exists
    const nna = await this.prisma.person.findUnique({ where: { id: dto.nnaId } });
    if (!nna) {
      throw new BadRequestException('El NNA titular no existe');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Case
      const newCase = await tx.case.create({
        data: {
          caseCode,
          caseType: dto.caseType,
          currentPhase: Phase.DERIVACION,
          currentInterventionPath: InterventionPath.GESTION_ADMINISTRATIVA,
          intakeNarrative: dto.intakeNarrative,
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
      // Close previous active assignment for this role if any
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
      // 1. Close all active assignments for fromUser
      await tx.caseTeamHistory.updateMany({
        where: {
          userId: dto.fromUserId,
          endDate: null,
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
}
