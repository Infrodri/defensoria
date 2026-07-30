import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseType, Role, RoleInCase, Phase, InterventionPath, RiskLevel } from '@defensoria/shared';

export interface CreateCaseDto {
  caseType: CaseType;
  nnaId: string;
  complainantId?: string;
  accusedId?: string;
  intakeNarrative: string;
}

export interface AssignTeamDto {
  userId: string;
  role: Role;
  reason: string;
}

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
  constructor(private prisma: PrismaService) {}

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
    // Jefatura & Secretaria see all cases in office
    if (user.role === Role.JEFATURA || user.role === Role.SECRETARIA) {
      return this.prisma.case.findMany({
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

    // Professionals (Abogado, Psicologo, Social) see cases assigned to them (active or historical)
    return this.prisma.case.findMany({
      where: {
        teamHistory: {
          some: {
            userId: user.id,
          },
        },
      },
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

  async findOne(id: string) {
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
}
