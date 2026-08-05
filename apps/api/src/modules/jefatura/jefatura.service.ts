import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';

@Injectable()
export class JefaturaService {
  private readonly logger = new Logger(JefaturaService.name);

  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  async getWorkload(user: AccessUser) {
    const officeId = user.officeId;
    if (!officeId) {
      throw new BadRequestException('El usuario no tiene una oficina asignada');
    }

    const professionals = await this.prisma.user.findMany({
      where: { officeId, isActive: true },
      select: { id: true, firstName: true, lastName: true, role: true },
    });

    const workload = [];

    for (const prof of professionals) {
      const activeCases = await this.prisma.case.count({
        where: { currentOfficeId: officeId, isClosed: false },
      });

      const draftReports = await this.prisma.report.count({
        where: { authorId: prof.id, status: 'BORRADOR' },
      });

      const issuedReports = await this.prisma.report.count({
        where: { authorId: prof.id, status: 'EMITIDO' },
      });

      const overdueDeadlines = await this.prisma.processualDeadline.count({
        where: {
          case: { currentOfficeId: officeId },
          status: 'VENCIDO',
        },
      });

      const upcomingDeadlines = await this.prisma.processualDeadline.count({
        where: {
          case: { currentOfficeId: officeId },
          status: 'PROXIMO',
        },
      });

      const assignedCases = await this.prisma.caseTeamHistory.count({
        where: { userId: prof.id, endDate: null },
      });

      workload.push({
        userId: prof.id,
        name: `${prof.firstName} ${prof.lastName}`,
        role: prof.role,
        activeCases,
        assignedCases,
        draftReports,
        issuedReports,
        overdueDeadlines,
        upcomingDeadlines,
      });
    }

    return {
      officeId,
      officeName: await this.getOfficeName(officeId),
      totalProfessionals: professionals.length,
      totalActiveCases: await this.prisma.case.count({ where: { currentOfficeId: officeId, isClosed: false } }),
      totalOverdueAlerts: workload.reduce((sum, w) => sum + w.overdueDeadlines, 0),
      totalUpcomingAlerts: workload.reduce((sum, w) => sum + w.upcomingDeadlines, 0),
      totalDraftReports: workload.reduce((sum, w) => sum + w.draftReports, 0),
      totalIssuedReports: workload.reduce((sum, w) => sum + w.issuedReports, 0),
      professionals: workload,
    };
  }

  async closeCase(caseId: string, closureReason: string, user: AccessUser) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      throw new NotFoundException('Expediente no encontrado');
    }

    if (caseData.isClosed) {
      throw new BadRequestException('El expediente ya est cerrado');
    }

    if (!closureReason || closureReason.trim().length === 0) {
      throw new BadRequestException('Se requiere una razn de cierre');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.case.update({
        where: { id: caseId },
        data: {
          isClosed: true,
          closedAt: new Date(),
          closedBy: user.id,
          closureReason,
        },
      });

      await tx.actionLog.create({
        data: {
          caseId,
          authorId: user.id,
          actionType: 'OTRO',
          title: 'Cierre de expediente',
          content: `Motivo: ${closureReason}`,
          isSigned: true,
          signedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          userRole: user.role,
          action: 'CASE_CLOSE',
          entityType: 'Case',
          entityId: caseId,
          details: { closureReason },
        },
      });
    });

    return { success: true, message: 'Expediente cerrado correctamente', caseId };
  }

  async reopenCase(caseId: string, reopenReason: string, user: AccessUser) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      throw new NotFoundException('Expediente no encontrado');
    }

    if (!caseData.isClosed) {
      throw new BadRequestException('El expediente no est cerrado');
    }

    if (!reopenReason || reopenReason.trim().length === 0) {
      throw new BadRequestException('Se requiere una razn de reapertura');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.case.update({
        where: { id: caseId },
        data: {
          isClosed: false,
          closedAt: null,
          closedBy: null,
          closureReason: null,
        },
      });

      await tx.actionLog.create({
        data: {
          caseId,
          authorId: user.id,
          actionType: 'OTRO',
          title: 'Reapertura de expediente',
          content: `Motivo: ${reopenReason}`,
          isSigned: true,
          signedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          userRole: user.role,
          action: 'CASE_REOPEN',
          entityType: 'Case',
          entityId: caseId,
          details: { reopenReason },
        },
      });
    });

    return { success: true, message: 'Expediente reabierto correctamente', caseId };
  }

  async getAuditLogs(
    userId?: string,
    action?: string,
    fromDate?: string,
    toDate?: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const where: any = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const total = await this.prisma.auditLog.count({ where });

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });

    return {
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  private async getOfficeName(officeId: string): Promise<string> {
    const office = await this.prisma.office.findUnique({
      where: { id: officeId },
      select: { name: true },
    });
    return office?.name ?? 'Oficina desconocida';
  }
}