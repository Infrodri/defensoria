import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { Role } from '@prisma/client';

export interface AccessUser {
  id: string;
  role: Role;
  officeId: string | null;
  isPortal?: boolean;
  caseCode?: string;
}

@Injectable()
export class CaseAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertUserHasAccess(caseId: string, user: AccessUser): Promise<void> {
    if (!user) {
      throw new ForbiddenException('No hay usuario autenticado');
    }

    // Regla d: Portal
    if (user.isPortal) {
      const dbCase = await this.prisma.case.findUnique({
        where: { id: caseId },
        select: { caseCode: true },
      });

      if (!dbCase) {
        throw new NotFoundException('Expediente no encontrado');
      }

      if (dbCase.caseCode !== user.caseCode) {
        throw new ForbiddenException('No tiene permisos para acceder a este expediente como tutor');
      }
      return; // Acceso concedido
    }

    // Regla a: ADMINISTRADOR
    if (user.role === 'ADMINISTRADOR') {
      return; // Acceso total
    }

    // Regla b: JEFATURA o SECRETARIA
    if (user.role === 'JEFATURA' || user.role === 'SECRETARIA') {
      const dbCase = await this.prisma.case.findUnique({
        where: { id: caseId },
        select: { currentOfficeId: true },
      });

      if (!dbCase) {
        throw new NotFoundException('Expediente no encontrado');
      }

      if (dbCase.currentOfficeId !== user.officeId) {
        throw new ForbiddenException('No tiene permisos para acceder a expedientes de otra oficina distrital');
      }
      return; // Acceso concedido
    }

    // Regla c: ABOGADO, PSICOLOGO, SOCIAL
    if (user.role === 'ABOGADO' || user.role === 'PSICOLOGO' || user.role === 'SOCIAL') {
      const activeMembership = await this.prisma.caseTeamHistory.findFirst({
        where: {
          caseId: caseId,
          userId: user.id,
          endDate: null, // SOLO membresía activa
        },
      });

      if (!activeMembership) {
        throw new ForbiddenException('No tiene membresía activa en el equipo de este expediente');
      }
      return; // Acceso concedido
    }

    // Regla e: Deny by default
    throw new ForbiddenException('Rol no autorizado para acceder a este recurso');
  }

  async canAccess(caseId: string, user: AccessUser): Promise<boolean> {
    try {
      await this.assertUserHasAccess(caseId, user);
      return true;
    } catch (e) {
      if (e instanceof ForbiddenException || e instanceof NotFoundException) {
        return false;
      }
      throw e;
    }
  }
}
