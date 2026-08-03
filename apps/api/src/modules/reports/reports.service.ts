import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportType, ReportStatus, RiskLevel, Role } from '@defensoria/shared';

export interface CreateReportDto {
  caseId: string;
  reportType: ReportType;
  title: string;
  content: string;
  riskAssessment?: RiskLevel;
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private checkReportRolePermission(reportType: ReportType, userRole: Role) {
    if (userRole === Role.JEFATURA) return; // Jefatura can manage all

    if (reportType === ReportType.INFORME_PSICOLOGICO && userRole !== Role.PSICOLOGO) {
      throw new ForbiddenException('Solo el área de Psicología puede redactar informes psicológicos');
    }

    if (reportType === ReportType.INFORME_SOCIAL && userRole !== Role.SOCIAL) {
      throw new ForbiddenException('Solo el área de Trabajo Social puede redactar informes sociales');
    }

    if (reportType === ReportType.INFORME_JURIDICO && userRole !== Role.ABOGADO) {
      throw new ForbiddenException('Solo el área Legal (Abogado/a) puede redactar informes jurídicos');
    }
  }

  async create(dto: CreateReportDto, authorId: string, authorRole: Role) {
    this.checkReportRolePermission(dto.reportType, authorRole);

    const existingCase = await this.prisma.case.findUnique({ where: { id: dto.caseId } });
    if (!existingCase) {
      throw new NotFoundException('Expediente no encontrado');
    }

    // FIX 3 (Fase 0): snapshot de rol y disciplina VIGENTES del autor al momento
    // de crear el informe. Antes authorRoleSnapshot / authorDisciplineSnapshot
    // nunca se escribían. Fuente canónica de disciplina: user.discipline.name.
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: {
        role: true,
        discipline: { select: { name: true } },
      },
    });

    return this.prisma.report.create({
      data: {
        caseId: dto.caseId,
        authorId,
        reportType: dto.reportType,
        title: dto.title,
        content: dto.content,
        riskAssessment: dto.riskAssessment || null,
        status: ReportStatus.BORRADOR,
        version: 1,
        authorRoleSnapshot: author?.role ?? null,
        authorDisciplineSnapshot: author?.discipline?.name ?? null,
      },
    });
  }

  async emit(id: string, authorId: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('Informe no encontrado');
    }

    if (report.authorId !== authorId) {
      throw new ForbiddenException('Solo el autor original del informe puede emitirlo');
    }

    if (report.status === ReportStatus.EMITIDO) {
      throw new BadRequestException('Este informe ya ha sido emitido previamente y está congelado');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Freeze report status
      const emittedReport = await tx.report.update({
        where: { id },
        data: {
          status: ReportStatus.EMITIDO,
          emittedAt: new Date(),
        },
      });

      // 2. If Psychology report evaluated risk, update Case riskLevel automatically!
      if (report.reportType === ReportType.INFORME_PSICOLOGICO && report.riskAssessment) {
        await tx.case.update({
          where: { id: report.caseId },
          data: {
            riskLevel: report.riskAssessment,
          },
        });
      }

      return emittedReport;
    });
  }

  async createComplementary(parentReportId: string, content: string, title: string, authorId: string, authorRole: Role) {
    const parent = await this.prisma.report.findUnique({ where: { id: parentReportId } });
    if (!parent) {
      throw new NotFoundException('Informe original no encontrado');
    }

    if (parent.status !== ReportStatus.EMITIDO) {
      throw new BadRequestException('Solo se pueden crear informes complementarios sobre informes ya EMITIDOS');
    }

    this.checkReportRolePermission(parent.reportType as unknown as ReportType, authorRole);

    // FIX 3 (Fase 0): mismo snapshot de rol/disciplina vigentes que en create,
    // para que ningún Report se persista sin estos campos.
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: {
        role: true,
        discipline: { select: { name: true } },
      },
    });

    return this.prisma.report.create({
      data: {
        caseId: parent.caseId,
        authorId,
        reportType: parent.reportType,
        version: parent.version + 1,
        parentReportId: parent.id,
        title: title || `Complementario v${parent.version + 1} - ${parent.title}`,
        content,
        status: ReportStatus.BORRADOR,
        authorRoleSnapshot: author?.role ?? null,
        authorDisciplineSnapshot: author?.discipline?.name ?? null,
      },
    });
  }

  async findByCaseForRole(caseId: string, userRole: Role) {
    const reports = await this.prisma.report.findMany({
      where: { caseId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
        parentReport: { select: { id: true, title: true, version: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Si es SECRETARIA, filtrar solo metadata (no contenido)
    if (userRole === Role.SECRETARIA) {
      return reports.map((report) => ({
        id: report.id,
        caseId: report.caseId,
        reportType: report.reportType,
        status: report.status,
        version: report.version,
        title: report.title,
        createdAt: report.createdAt,
        author: report.author,
        parentReport: report.parentReport,
        // NO: content, riskAssessment
      }));
    }

    // Para otros roles, retornar completo
    return reports;
  }

  async findByCase(caseId: string) {
    return this.prisma.report.findMany({
      where: { caseId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
        parentReport: { select: { id: true, title: true, version: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
