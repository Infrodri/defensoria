import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Role, ReportType, ReportStatus, RiskLevel } from '@defensoria/shared';

describe('ReportsService Integration Tests', () => {
  let reportsService: ReportsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      case: {
        findUnique: vi.fn().mockResolvedValue({ id: 'case-1', riskLevel: null }),
        update: vi.fn(),
      },
      report: {
        create: vi.fn().mockResolvedValue({
          id: 'report-1',
          caseId: 'case-1',
          authorId: 'author-1',
          reportType: ReportType.INFORME_PSICOLOGICO,
          title: 'Test',
          content: 'Content',
          status: ReportStatus.BORRADOR,
          version: 1,
          authorRoleSnapshot: Role.PSICOLOGO,
          authorDisciplineSnapshot: 'PSICOLOGICA',
        }),
        findUnique: vi.fn().mockResolvedValue({
          id: 'report-1',
          caseId: 'case-1',
          authorId: 'author-1',
          reportType: ReportType.INFORME_PSICOLOGICO,
          status: ReportStatus.BORRADOR,
          riskAssessment: RiskLevel.ALTO,
        }),
        update: vi.fn().mockResolvedValue({ id: 'report-1', status: ReportStatus.EMITIDO, emittedAt: new Date() }),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'author-1',
          role: Role.PSICOLOGO,
          discipline: { name: 'PSICOLOGICA' },
        }),
      },
      $transaction: vi.fn((cb) => cb(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    reportsService = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create (Fix 3: authorRoleSnapshot + authorDisciplineSnapshot)', () => {
    it('debería escribir authorRoleSnapshot y authorDisciplineSnapshot con los valores VIGENTES del autor', async () => {
      const dto = {
        caseId: 'case-1',
        reportType: ReportType.INFORME_PSICOLOGICO,
        title: 'Informe Psicológico',
        content: 'Contenido del informe',
      };

      const result = await reportsService.create(dto, 'author-1', Role.PSICOLOGO);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'author-1' },
        select: { role: true, discipline: { select: { name: true } } },
      });

      expect(prisma.report.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          authorRoleSnapshot: Role.PSICOLOGO,
          authorDisciplineSnapshot: 'PSICOLOGICA',
        }),
      }));

      expect(result.authorRoleSnapshot).toBe(Role.PSICOLOGO);
      expect(result.authorDisciplineSnapshot).toBe('PSICOLOGICA');
    });

    it('debería validar que solo PSICOLOGO puede crear INFORME_PSICOLOGICO', async () => {
      const dto = {
        caseId: 'case-1',
        reportType: ReportType.INFORME_PSICOLOGICO,
        title: 'Informe',
        content: 'Contenido',
      };

      await expect(reportsService.create(dto, 'author-1', Role.ABOGADO))
        .rejects.toThrow(ForbiddenException);
    });

    it('debería validar que solo ABOGADO puede crear INFORME_JURIDICO', async () => {
      const dto = {
        caseId: 'case-1',
        reportType: ReportType.INFORME_JURIDICO,
        title: 'Informe',
        content: 'Contenido',
      };

      await expect(reportsService.create(dto, 'author-1', Role.PSICOLOGO))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('emit (congelado de informe)', () => {
    it('debería emitir solo si el autor es el original', async () => {
      const mockTx = {
        report: {
          update: vi.fn().mockResolvedValue({ id: 'report-1', status: ReportStatus.EMITIDO, emittedAt: new Date() }),
          findMany: vi.fn().mockResolvedValue([]),
        },
        case: {
          update: vi.fn(),
          findUnique: vi.fn().mockResolvedValue({ id: 'case-1', currentPhase: 'EVALUACION' }),
        },
        caseTeamHistory: {
          findMany: vi.fn().mockResolvedValue([]),
          findFirst: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
        actionLog: {
          create: vi.fn(),
        },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx as any));

      await reportsService.emit('report-1', 'author-1');
      expect(mockTx.report.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: { status: ReportStatus.EMITIDO, emittedAt: expect.any(Date) },
      });
    });

    it('debería rechazar si no es el autor original', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        id: 'report-1',
        authorId: 'author-1',
        status: ReportStatus.BORRADOR,
      } as any);

      await expect(reportsService.emit('report-1', 'other-author'))
        .rejects.toThrow(ForbiddenException);
    });

    it('debería rechazar si ya está EMITIDO', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        id: 'report-1',
        authorId: 'author-1',
        status: ReportStatus.EMITIDO,
      } as any);

      await expect(reportsService.emit('report-1', 'author-1'))
        .rejects.toThrow(BadRequestException);
    });

    it('debería avanzar automáticamente a SEGUIMIENTO si todos los profesionales asignados emitieron su informe inicial', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        id: 'report-1',
        caseId: 'case-123',
        authorId: 'user-psych',
        reportType: ReportType.INFORME_PSICOLOGICO,
        status: ReportStatus.BORRADOR,
      } as any);

      const mockTx = {
        report: {
          update: vi.fn().mockResolvedValue({ id: 'report-1', status: ReportStatus.EMITIDO, emittedAt: new Date() }),
          findMany: vi.fn().mockResolvedValue([
            { authorId: 'user-psych', authorRoleSnapshot: Role.PSICOLOGO },
            { authorId: 'user-social', authorRoleSnapshot: Role.SOCIAL },
          ]),
        },
        case: {
          update: vi.fn(),
          findUnique: vi.fn().mockResolvedValue({ id: 'case-123', currentPhase: 'EVALUACION' }),
        },
        caseTeamHistory: {
          findMany: vi.fn().mockResolvedValue([
            { userId: 'user-psych', role: Role.PSICOLOGO },
            { userId: 'user-social', role: Role.SOCIAL },
          ]),
          findFirst: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
        actionLog: {
          create: vi.fn(),
        },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx as any));

      await reportsService.emit('report-1', 'user-psych');

      expect(mockTx.case.update).toHaveBeenCalledWith({
        where: { id: 'case-123' },
        data: { currentPhase: 'SEGUIMIENTO' },
      });
      expect(mockTx.actionLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Transición Automática a SEGUIMIENTO',
        }),
      });
    });

    it('debería cerrar el caso por Conciliación al emitir INFORME_FINAL_CONCILIACION', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        id: 'report-conciliation',
        caseId: 'case-123',
        authorId: 'user-lawyer',
        reportType: ReportType.INFORME_FINAL_CONCILIACION,
        status: ReportStatus.BORRADOR,
      } as any);

      const mockTx = {
        report: {
          update: vi.fn().mockResolvedValue({ id: 'report-conciliation', status: ReportStatus.EMITIDO }),
          findMany: vi.fn().mockResolvedValue([]),
        },
        case: {
          update: vi.fn(),
          findUnique: vi.fn().mockResolvedValue({ id: 'case-123', currentPhase: 'SEGUIMIENTO' }),
        },
        caseTeamHistory: {
          findMany: vi.fn().mockResolvedValue([]),
          findFirst: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
        actionLog: {
          create: vi.fn(),
        },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx as any));

      await reportsService.emit('report-conciliation', 'user-lawyer');

      expect(mockTx.case.update).toHaveBeenCalledWith({
        where: { id: 'case-123' },
        data: expect.objectContaining({
          isClosed: true,
          closureReason: 'Cierre por Informe Final de Conciliación',
          currentPhase: 'CIERRE',
          currentInterventionPath: 'CONCILIACION',
        }),
      });
    });
  });
});