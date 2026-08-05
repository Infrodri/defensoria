import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Role, ReportCategory, ReportStatus, RiskLevel } from '@defensoria/shared';

// Mapeo de disciplineReportTypeId -> category usado por el mock de prisma.
const DRT_CATEGORY: Record<string, ReportCategory> = {
  'drt-psicologico': ReportCategory.INFORME_PSICOLOGICO,
  'drt-juridico': ReportCategory.INFORME_JURIDICO,
  'drt-social': ReportCategory.INFORME_SOCIAL,
  'drt-psicosocial': ReportCategory.INFORME_PSICOSOCIAL,
  'drt-final-conciliacion': ReportCategory.INFORME_FINAL_CONCILIACION,
};

const mockEmitTx = (overrides: Record<string, unknown> = {}) => ({
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
  ...overrides,
});

describe('ReportsService Integration Tests', () => {
  let reportsService: ReportsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      disciplineReportType: {
        findUnique: vi.fn().mockImplementation(({ where }: { where: { id: string } }) => {
          return DRT_CATEGORY[where.id] ? { category: DRT_CATEGORY[where.id] } : null;
        }),
      },
      case: {
        findUnique: vi.fn().mockResolvedValue({ id: 'case-1', riskLevel: null }),
        update: vi.fn(),
      },
      report: {
        create: vi.fn().mockResolvedValue({
          id: 'report-1',
          caseId: 'case-1',
          authorId: 'author-1',
          disciplineReportTypeId: 'drt-psicologico',
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
          status: ReportStatus.BORRADOR,
          riskAssessment: RiskLevel.ALTO,
          disciplineReportType: { category: ReportCategory.INFORME_PSICOLOGICO },
          author: { role: Role.PSICOLOGO },
          coAuthor: null,
        }),
        update: vi.fn().mockResolvedValue({ id: 'report-1', status: ReportStatus.EMITIDO, emittedAt: new Date() }),
        findMany: vi.fn().mockResolvedValue([]),
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
        disciplineReportTypeId: 'drt-psicologico',
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
          disciplineReportTypeId: 'drt-psicologico',
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
        disciplineReportTypeId: 'drt-psicologico',
        title: 'Informe',
        content: 'Contenido',
      };

      await expect(reportsService.create(dto, 'author-1', Role.ABOGADO))
        .rejects.toThrow(ForbiddenException);
    });

    it('debería validar que solo ABOGADO puede crear INFORME_JURIDICO', async () => {
      const dto = {
        caseId: 'case-1',
        disciplineReportTypeId: 'drt-juridico',
        title: 'Informe',
        content: 'Contenido',
      };

      await expect(reportsService.create(dto, 'author-1', Role.PSICOLOGO))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('emit (congelado de informe)', () => {
    it('debería emitir solo si el autor es el original', async () => {
      const mockTx = mockEmitTx();
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
        status: ReportStatus.BORRADOR,
        disciplineReportType: { category: ReportCategory.INFORME_PSICOLOGICO },
        author: { role: Role.PSICOLOGO },
        coAuthor: null,
      } as any);

      const mockTx = mockEmitTx({
        report: {
          update: vi.fn().mockResolvedValue({ id: 'report-1', status: ReportStatus.EMITIDO, emittedAt: new Date() }),
          findMany: vi.fn().mockResolvedValue([
            { authorId: 'user-psych', authorRoleSnapshot: Role.PSICOLOGO },
            { authorId: 'user-social', authorRoleSnapshot: Role.SOCIAL },
          ]),
        },
        caseTeamHistory: {
          findMany: vi.fn().mockResolvedValue([
            { userId: 'user-psych', role: Role.PSICOLOGO },
            { userId: 'user-social', role: Role.SOCIAL },
          ]),
          findFirst: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
      });
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
        status: ReportStatus.BORRADOR,
        disciplineReportType: { category: ReportCategory.INFORME_FINAL_CONCILIACION },
        author: { role: Role.ABOGADO },
        coAuthor: null,
      } as any);

      const mockTx = mockEmitTx({
        case: {
          update: vi.fn(),
          findUnique: vi.fn().mockResolvedValue({ id: 'case-123', currentPhase: 'SEGUIMIENTO' }),
        },
      });
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

  describe('emit — validación de coautoría en INFORME_PSICOSOCIAL (Tarea B)', () => {
    it('debería rechazar la emisión de un INFORME_PSICOSOCIAL sin coautor', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        id: 'report-psicosocial',
        caseId: 'case-1',
        authorId: 'author-1',
        status: ReportStatus.BORRADOR,
        disciplineReportType: { category: ReportCategory.INFORME_PSICOSOCIAL },
        author: { role: Role.PSICOLOGO },
        coAuthor: null,
        coAuthorId: null,
      } as any);

      await expect(reportsService.emit('report-psicosocial', 'author-1'))
        .rejects.toThrow(BadRequestException);
    });

    it('debería rechazar la emisión de un INFORME_PSICOSOCIAL cuyo coautor tiene el mismo rol que el autor', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        id: 'report-psicosocial',
        caseId: 'case-1',
        authorId: 'author-1',
        status: ReportStatus.BORRADOR,
        disciplineReportType: { category: ReportCategory.INFORME_PSICOSOCIAL },
        author: { role: Role.PSICOLOGO },
        coAuthor: { role: Role.PSICOLOGO },
        coAuthorId: 'author-2',
      } as any);

      await expect(reportsService.emit('report-psicosocial', 'author-1'))
        .rejects.toThrow(BadRequestException);
    });

    it('debería aceptar la emisión de un INFORME_PSICOSOCIAL con autor PSICOLOGO y coautor SOCIAL', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        id: 'report-psicosocial',
        caseId: 'case-1',
        authorId: 'author-1',
        status: ReportStatus.BORRADOR,
        disciplineReportType: { category: ReportCategory.INFORME_PSICOSOCIAL },
        author: { role: Role.PSICOLOGO },
        coAuthor: { role: Role.SOCIAL },
        coAuthorId: 'author-2',
      } as any);

      const mockTx = mockEmitTx();
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx as any));

      await reportsService.emit('report-psicosocial', 'author-1');

      expect(mockTx.report.update).toHaveBeenCalledWith({
        where: { id: 'report-psicosocial' },
        data: { status: ReportStatus.EMITIDO, emittedAt: expect.any(Date) },
      });
    });

    it('debería aceptar la emisión de un INFORME_PSICOSOCIAL con autor SOCIAL y coautor PSICOLOGO (invertido)', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        id: 'report-psicosocial',
        caseId: 'case-1',
        authorId: 'author-1',
        status: ReportStatus.BORRADOR,
        disciplineReportType: { category: ReportCategory.INFORME_PSICOSOCIAL },
        author: { role: Role.SOCIAL },
        coAuthor: { role: Role.PSICOLOGO },
        coAuthorId: 'author-2',
      } as any);

      const mockTx = mockEmitTx();
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx as any));

      await reportsService.emit('report-psicosocial', 'author-1');

      expect(mockTx.report.update).toHaveBeenCalledWith({
        where: { id: 'report-psicosocial' },
        data: { status: ReportStatus.EMITIDO, emittedAt: expect.any(Date) },
      });
    });

    it('debería permitir CREAR un INFORME_PSICOSOCIAL en borrador sin coautor (la validación es solo de emisión)', async () => {
      const dto = {
        caseId: 'case-1',
        disciplineReportTypeId: 'drt-psicosocial',
        title: 'Informe Psicosocial',
        content: 'Contenido',
      };

      const result = await reportsService.create(dto, 'author-1', Role.PSICOLOGO);

      expect(prisma.report.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          disciplineReportTypeId: 'drt-psicosocial',
          status: ReportStatus.BORRADOR,
        }),
      }));
      expect(result.status).toBe(ReportStatus.BORRADOR);
    });

    it('debería aceptar la emisión de un informe de otra categoría sin coautor', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        id: 'report-social',
        caseId: 'case-1',
        authorId: 'author-1',
        status: ReportStatus.BORRADOR,
        disciplineReportType: { category: ReportCategory.INFORME_SOCIAL },
        author: { role: Role.SOCIAL },
        coAuthor: null,
        coAuthorId: null,
      } as any);

      const mockTx = mockEmitTx();
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx as any));

      await reportsService.emit('report-social', 'author-1');

      expect(mockTx.report.update).toHaveBeenCalledWith({
        where: { id: 'report-social' },
        data: { status: ReportStatus.EMITIDO, emittedAt: expect.any(Date) },
      });
    });
  });
  describe('assignCoAuthor (GAP Fase 2: escritura de coAuthorId)', () => {
    const psicosocialReport = {
      id: 'report-psicosocial',
      caseId: 'case-1',
      authorId: 'author-1',
      status: ReportStatus.BORRADOR,
      disciplineReportType: { category: ReportCategory.INFORME_PSICOSOCIAL },
      author: { role: Role.PSICOLOGO },
    };

    it('debería asignar el coautor cuando el autor lo solicita sobre un borrador psicosocial', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue(psicosocialReport as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'author-2', role: Role.SOCIAL } as any);
      vi.mocked(prisma.report.update).mockResolvedValue({
        id: 'report-psicosocial',
        coAuthorId: 'author-2',
      } as any);

      const result = await reportsService.assignCoAuthor('report-psicosocial', 'author-2', 'author-1', Role.PSICOLOGO);

      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-psicosocial' },
        data: { coAuthorId: 'author-2' },
      });
      expect(result.coAuthorId).toBe('author-2');
    });

    it('debería permitir que JEFATURA asigne coautor aunque no sea el autor', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue(psicosocialReport as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'author-2', role: Role.SOCIAL } as any);
      vi.mocked(prisma.report.update).mockResolvedValue({ id: 'report-psicosocial', coAuthorId: 'author-2' } as any);

      await reportsService.assignCoAuthor('report-psicosocial', 'author-2', 'jefatura-1', Role.JEFATURA);

      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-psicosocial' },
        data: { coAuthorId: 'author-2' },
      });
    });

    it('debería rechazar si el solicitante no es el autor ni JEFATURA/ADMINISTRADOR', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue(psicosocialReport as any);

      await expect(reportsService.assignCoAuthor('report-psicosocial', 'author-2', 'other-1', Role.SOCIAL))
        .rejects.toThrow(ForbiddenException);
    });

    it('debería rechazar si el informe ya está EMITIDO', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        ...psicosocialReport,
        status: ReportStatus.EMITIDO,
      } as any);

      await expect(reportsService.assignCoAuthor('report-psicosocial', 'author-2', 'author-1', Role.PSICOLOGO))
        .rejects.toThrow(BadRequestException);
    });

    it('debería rechazar si la categoría no es INFORME_PSICOSOCIAL', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        ...psicosocialReport,
        disciplineReportType: { category: ReportCategory.INFORME_SOCIAL },
      } as any);

      await expect(reportsService.assignCoAuthor('report-social', 'author-2', 'author-1', Role.PSICOLOGO))
        .rejects.toThrow(BadRequestException);
    });

    it('debería rechazar si el coautor tiene el mismo rol que el autor (no complementario)', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue(psicosocialReport as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'author-2', role: Role.PSICOLOGO } as any);

      await expect(reportsService.assignCoAuthor('report-psicosocial', 'author-2', 'author-1', Role.PSICOLOGO))
        .rejects.toThrow(BadRequestException);
    });

    it('debería rechazar si el coautor es la misma persona que el autor', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue(psicosocialReport as any);

      await expect(reportsService.assignCoAuthor('report-psicosocial', 'author-1', 'author-1', Role.PSICOLOGO))
        .rejects.toThrow(BadRequestException);
    });

    it('debería rechazar si el usuario coautor no existe', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue(psicosocialReport as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(reportsService.assignCoAuthor('report-psicosocial', 'ghost-1', 'author-1', Role.PSICOLOGO))
        .rejects.toThrow(NotFoundException);
    });

    it('debería aceptar autor SOCIAL con coautor PSICOLOGO (complementario invertido)', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        ...psicosocialReport,
        author: { role: Role.SOCIAL },
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'author-2', role: Role.PSICOLOGO } as any);
      vi.mocked(prisma.report.update).mockResolvedValue({ id: 'report-psicosocial', coAuthorId: 'author-2' } as any);

      const result = await reportsService.assignCoAuthor('report-psicosocial', 'author-2', 'author-1', Role.SOCIAL);

      expect(result.coAuthorId).toBe('author-2');
    });
  });
});
