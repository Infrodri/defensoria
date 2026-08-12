import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CasesService } from './cases.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Role, RoleInCase, Phase, InterventionPath } from '@defensoria/shared';

describe('CasesService Integration Tests', () => {
  let casesService: CasesService;
  let caseAccessService: CaseAccessService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      case: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
      },
      caseParty: {
        create: vi.fn(),
      },
      caseOfficeHistory: {
        create: vi.fn(),
      },
      interventionPathHistory: {
        create: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      person: {
        findUnique: vi.fn(),
      },
      caseTeamHistory: {
        updateMany: vi.fn(),
        create: vi.fn(),
        createMany: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      appointment: {
        updateMany: vi.fn(),
      },
      socialIntakeForm: {
        findUnique: vi.fn(),
      },
      report: {
        findMany: vi.fn(),
      },
      conciliationEvaluation: {
        findUnique: vi.fn(),
      },
      conciliationProcess: {
        findMany: vi.fn(),
      },
      inspection: {
        findMany: vi.fn(),
      },
      evidence: {
        findMany: vi.fn(),
      },
      discrepancyAnalysis: {
        findMany: vi.fn(),
      },
      penalTypicityAnalysis: {
        findMany: vi.fn(),
      },
      riskScaleAnalysis: {
        findMany: vi.fn(),
      },
      clinicalTranslation: {
        findMany: vi.fn(),
      },
      traumaAnalysis: {
        findMany: vi.fn(),
      },
      environmentalMapping: {
        findMany: vi.fn(),
      },
      transversalUnifiedTimeline: {
        findMany: vi.fn(),
      },
      transversalAnonymizedReport: {
        findMany: vi.fn(),
      },
      actionLog: {
        create: vi.fn(),
      },
      $queryRaw: vi.fn(),
      $transaction: vi.fn((cb) => cb(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CasesService,
        { provide: PrismaService, useValue: prismaMock },
        { 
          provide: CaseAccessService, 
          useValue: { assertUserHasAccess: vi.fn() } 
        },
      ],
    }).compile();

    casesService = module.get<CasesService>(CasesService);
    caseAccessService = module.get<CaseAccessService>(CaseAccessService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findOne (Security Fix)', () => {
    it('debería rechazar si assertUserHasAccess lanza ForbiddenException', async () => {
      vi.mocked(caseAccessService.assertUserHasAccess).mockRejectedValue(
        new ForbiddenException('No tiene permisos para acceder a expedientes de otra oficina distrital')
      );

      const user = { id: 'user-1', role: Role.SECRETARIA, officeId: 'office-1' };
      
      await expect(casesService.findOne('case-123', user)).rejects.toThrow(ForbiddenException);
      
      // Asegurarse de que no llega a consultar el caso a Prisma
      expect(prisma.case.findUnique).not.toHaveBeenCalled();
    });

    it('debería consultar el expediente si assertUserHasAccess pasa', async () => {
      vi.mocked(caseAccessService.assertUserHasAccess).mockResolvedValue(undefined);
      vi.mocked(prisma.case.findUnique).mockResolvedValue({ id: 'case-123', caseCode: 'DNA-2026-0001' } as any);

      const user = { id: 'user-1', role: Role.ADMINISTRADOR, officeId: null };
      
      const result = await casesService.findOne('case-123', user);
      
      expect(result).toBeDefined();
      expect(caseAccessService.assertUserHasAccess).toHaveBeenCalledWith('case-123', user);
      expect(prisma.case.findUnique).toHaveBeenCalled();
    });
  });

  describe('findAll (Scoping Fix)', () => {
    it('SECRETARIA y JEFATURA: debería agregar la cláusula where { currentOfficeId: user.officeId, isDisabled: false } a Prisma', async () => {
      const user = { id: 'user-1', role: Role.SECRETARIA, officeId: 'office-dist-1' };
      vi.mocked(prisma.case.findMany).mockResolvedValue([]);

      await casesService.findAll(user);

      // Verificamos que la query incluye la cláusula where estricta por oficina + isDisabled
      expect(prisma.case.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { currentOfficeId: 'office-dist-1', isDisabled: false },
      }));
    });

    it('ADMINISTRADOR: NO debería agregar cláusula where currentOfficeId, consultando todas las oficinas (pero sí isDisabled: false)', async () => {
      const user = { id: 'user-admin', role: Role.ADMINISTRADOR, officeId: null };
      vi.mocked(prisma.case.findMany).mockResolvedValue([]);

      await casesService.findAll(user);

      // Verificamos que la query de Administrador NO incluye "where: { currentOfficeId }" pero SÍ isDisabled: false
      expect(prisma.case.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ isDisabled: false }),
      }));
      expect(prisma.case.findMany).toHaveBeenCalledWith(expect.not.objectContaining({
        where: expect.objectContaining({ currentOfficeId: expect.anything() })
      }));
    });
  });

  // ===== FASE 0 BUG FIXES =====

  describe('assignTeam (Fix 1 & 2: duplicados + validación rol)', () => {
    beforeEach(() => {
      vi.mocked(prisma.case.findUnique).mockResolvedValue({ id: 'case-1', isDisabled: false });
      vi.mocked(caseAccessService.assertUserHasAccess).mockResolvedValue(undefined);
    });

    it('Fix 1: debería cerrar asignación activa previa del mismo (caseId, role) antes de crear la nueva', async () => {
      const mockTx = {
        caseTeamHistory: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: 'cth-new', caseId: 'case-1', role: Role.ABOGADO, userId: 'user-target', endDate: null, assignedBy: 'user-assigner', reason: undefined }),
        },
        appointment: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
        actionLog: {
          create: vi.fn(),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue({ id: 'user-target', role: Role.ABOGADO }),
        },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx));

      const dto = { userId: 'user-target', role: Role.ABOGADO };
      
      await casesService.assignTeam('case-1', dto, 'user-assigner');

      // 1. updateMany para cerrar activos previos
      expect(mockTx.caseTeamHistory.updateMany).toHaveBeenCalledWith({
        where: { caseId: 'case-1', role: Role.ABOGADO, endDate: null },
        data: { endDate: expect.any(Date) },
      });
      // 2. create la nueva asignación
      expect(mockTx.caseTeamHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          caseId: 'case-1',
          role: Role.ABOGADO,
          userId: 'user-target',
          // endDate no se pasa explícitamente (default null en schema)
        }),
      });
    });

    it('Fix 2: debería rechazar si el usuario destino NO tiene el rol solicitado', async () => {
      const mockTx = {
        user: {
          findUnique: vi.fn().mockResolvedValue({ id: 'user-target', role: Role.SECRETARIA }),
        },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx));

      const dto = { userId: 'user-target', role: Role.ABOGADO };
      
      await expect(casesService.assignTeam('case-1', dto, 'user-assigner'))
        .rejects.toThrow(BadRequestException);
    });

    it('Fix 2: debería aceptar si el usuario destino TIENE el rol solicitado (ABOGADO/PSICOLOGO/SOCIAL)', async () => {
      const mockTx = {
        caseTeamHistory: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: 'cth-new' }),
        },
        appointment: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
        actionLog: {
          create: vi.fn(),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue({ id: 'user-target', role: Role.PSICOLOGO }),
        },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx));

      const dto = { userId: 'user-target', role: Role.PSICOLOGO };
      
      await expect(casesService.assignTeam('case-1', dto, 'user-assigner')).resolves.toBeDefined();
    });

    it('debería transferir citas pendientes del profesional anterior al nuevo profesional asignado', async () => {
      const mockTx = {
        caseTeamHistory: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          findFirst: vi.fn().mockResolvedValue({ userId: 'user-old' }),
          create: vi.fn().mockResolvedValue({ id: 'cth-new' }),
        },
        appointment: {
          updateMany: vi.fn().mockResolvedValue({ count: 2 }),
        },
        actionLog: {
          create: vi.fn().mockResolvedValue({ id: 'log-1' }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue({ id: 'user-new', role: Role.ABOGADO }),
        },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx));

      const dto = { userId: 'user-new', role: Role.ABOGADO };
      await casesService.assignTeam('case-1', dto, 'user-assigner');

      expect(mockTx.appointment.updateMany).toHaveBeenCalledWith({
        where: {
          caseId: 'case-1',
          assignedProfessionalId: 'user-old',
          status: { in: ['PROPUESTA', 'PROGRAMADA'] },
        },
        data: {
          assignedProfessionalId: 'user-new',
          status: 'PROPUESTA',
          professionalResponse: null,
          professionalNotes: null,
          respondedAt: null,
        },
      });

      expect(mockTx.actionLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          caseId: 'case-1',
          authorId: 'user-assigner',
          actionType: 'NOTA',
          title: 'Reasignación automática de citas',
        }),
      });
    });
  });

  describe('generateCaseCode (Fix 6: secuencia atómica)', () => {
    it('debería usar nextval de la secuencia case_code_seq y formatear DNA-YYYY-NNNN', async () => {
      vi.mocked(prisma.person.findUnique).mockResolvedValue({ id: 'nna-1' } as any);
      
      const mockTx = {
        case: { create: vi.fn().mockResolvedValue({ id: 'case-new', caseCode: 'DNA-2026-0042' }) },
        caseParty: { create: vi.fn() },
        caseOfficeHistory: { create: vi.fn() },
        interventionPathHistory: { create: vi.fn() },
        person: { findUnique: vi.fn().mockResolvedValue({ id: 'nna-1' }) },
        $queryRaw: vi.fn().mockResolvedValue([{ nextval: 42 }]),
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx));
      vi.mocked(caseAccessService.assertUserHasAccess).mockResolvedValue(undefined);

      const dto = { 
        parties: [{ roleInCase: RoleInCase.NNA, personId: 'nna-1', isPrimary: true }], 
        caseType: 'CIVIL' as any, 
        intakeNarrative: 'test',
      };
      
      await casesService.create(dto, 'user-1', 'office-1');

      // Verificar que se llamó nextval en el cliente de transacción
      expect(mockTx.$queryRaw).toHaveBeenCalledWith(expect.anything());
      // Verificar que el caseCode se formó con la secuencia
      expect(mockTx.case.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ caseCode: 'DNA-2026-0042' }),
      }));
    });
  });

  describe('massTransfer (Fix 1: cierre de activos duplicados)', () => {
    beforeEach(() => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: 'from', role: Role.ABOGADO })
        .mockResolvedValueOnce({ id: 'to', role: Role.ABOGADO });
      vi.mocked(prisma.caseTeamHistory.findMany).mockResolvedValue([
        { caseId: 'case-1', role: Role.ABOGADO },
        { caseId: 'case-2', role: Role.ABOGADO },
      ]);
    });

    it('debería cerrar TODAS las filas activas de los (caseId, role) transferidos antes de crear nuevas', async () => {
      const mockTx = {
        caseTeamHistory: {
          updateMany: vi.fn().mockResolvedValue({ count: 2 }),
          create: vi.fn().mockResolvedValue({ id: 'cth-new' }),
          createMany: vi.fn().mockResolvedValue({ count: 2 }),
        },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx));

      await casesService.massTransfer({ fromUserId: 'from', toUserId: 'to', reason: 'traslado' }, 'admin-1');

      // updateMany con OR sobre los pares (caseId, role) - cierra activos de origen Y destino
       expect(mockTx.caseTeamHistory.updateMany).toHaveBeenCalledWith({
         where: {
           endDate: null,
           OR: [
             { caseId: 'case-1', role: Role.ABOGADO },
             { caseId: 'case-2', role: Role.ABOGADO },
           ],
         },
         data: { endDate: expect.any(Date) },
       });
     });
   });

   describe('getRecord (Fase 1 consolidated endpoint)', () => {
     it('should return full case record with all sub-resources and AI analyses', async () => {
       const mockCase = {
         id: 'case-123',
         caseCode: 'DNA-2026-0001',
         parties: [{ id: 'p1', person: { id: 'person-1', firstName: 'Ana', lastName: 'López' } }],
         currentOffice: { id: 'office-1', name: 'Fiscalía Distrital' },
       };
       const mockSocialIntake = { id: 'si-1', caseId: 'case-123', socialWorker: { id: 'sw-1', firstName: 'Carlos', lastName: 'García' } };
       const mockReports = [{ id: 'r1', caseId: 'case-123', title: 'Informe inicial', author: { id: 'u1', firstName: 'Laura', lastName: 'Pérez', role: 'ABOGADO' }, parentReport: null }];
       const mockEvaluation = { id: 'ce-1', caseId: 'case-123', evaluator: { id: 'u2', firstName: 'María', lastName: 'Solíz' } };
       const mockProcesses = [{ id: 'cp-1', caseId: 'case-123', leadLawyer: { id: 'u3', firstName: 'Pedro', lastName: 'Chávez' } }];
       const mockInspections = [{ id: 'i1', caseId: 'case-123', establishment: {}, inspector: {}, location: {}, findings: [], evidenceFiles: [] }];
       const mockEvidences = [{ id: 'e1', caseId: 'case-123', uploader: { id: 'u4', firstName: 'Rosa', lastName: 'Espinoza', role: 'ADMINISTRADOR' } }];
       const mockDiscrepancies = [{ id: 'd1', caseId: 'case-123' }];
       const mockTypicity = [{ id: 't1', caseId: 'case-123' }];
       const mockRiskScales = [{ id: 'rs1', caseId: 'case-123' }];
       const mockClinicalTranslations = [{ id: 'ct1', caseId: 'case-123' }];
       const mockTrauma = [{ id: 'ta1', caseId: 'case-123' }];
       const mockEnvironmental = [{ id: 'em1', caseId: 'case-123' }];
       const mockTimeline = [{ id: 'tl1', caseId: 'case-123' }];
       const mockAnonymized = [{ id: 'ar1', caseId: 'case-123' }];

       vi.mocked(prisma.case.findUnique).mockResolvedValue(mockCase as any);
       vi.mocked(prisma.socialIntakeForm.findUnique).mockResolvedValue(mockSocialIntake as any);
       vi.mocked(prisma.report.findMany).mockResolvedValue(mockReports as any);
       vi.mocked(prisma.conciliationEvaluation.findUnique).mockResolvedValue(mockEvaluation as any);
       vi.mocked(prisma.conciliationProcess.findMany).mockResolvedValue(mockProcesses as any);
       vi.mocked(prisma.inspection.findMany).mockResolvedValue(mockInspections as any);
       vi.mocked(prisma.evidence.findMany).mockResolvedValue(mockEvidences as any);
       vi.mocked(prisma.discrepancyAnalysis.findMany).mockResolvedValue(mockDiscrepancies as any);
       vi.mocked(prisma.penalTypicityAnalysis.findMany).mockResolvedValue(mockTypicity as any);
       vi.mocked(prisma.riskScaleAnalysis.findMany).mockResolvedValue(mockRiskScales as any);
       vi.mocked(prisma.clinicalTranslation.findMany).mockResolvedValue(mockClinicalTranslations as any);
       vi.mocked(prisma.traumaAnalysis.findMany).mockResolvedValue(mockTrauma as any);
       vi.mocked(prisma.environmentalMapping.findMany).mockResolvedValue(mockEnvironmental as any);
       vi.mocked((prisma as any).transversalUnifiedTimeline.findMany).mockResolvedValue(mockTimeline as any);
       vi.mocked((prisma as any).transversalAnonymizedReport.findMany).mockResolvedValue(mockAnonymized as any);
       vi.mocked(caseAccessService.assertUserHasAccess).mockResolvedValue(undefined);

       const result = await casesService.getRecord('case-123', { id: 'user-1', role: Role.ABOGADO } as any);

       expect(result.case).toBeDefined();
       expect(result.socialIntake).toBeDefined();
       expect(result.reports).toBeDefined();
       expect(result.conciliation).toBeDefined();
       expect(result.inspections).toBeDefined();
       expect(result.evidences).toBeDefined();
       expect(result.aiAnalyses).toBeDefined();
       expect(result.aiAnalyses.discrepancies).toHaveLength(1);
       expect(result.aiAnalyses.penalTypicity).toHaveLength(1);
       expect(result.aiAnalyses.riskScales).toHaveLength(1);
       expect(result.aiAnalyses.clinicalTranslations).toHaveLength(1);
       expect(result.aiAnalyses.trauma).toHaveLength(1);
       expect(result.aiAnalyses.environmental).toHaveLength(1);
       expect(result.aiAnalyses.transversalTimeline).toHaveLength(1);
       expect(result.aiAnalyses.transversalAnonymized).toHaveLength(1);
     });

     it('should throw NotFoundException if case does not exist', async () => {
       vi.mocked(prisma.case.findUnique).mockResolvedValue(null);
       vi.mocked(caseAccessService.assertUserHasAccess).mockResolvedValue(undefined);

       await expect(casesService.getRecord('case-999', { id: 'user-1', role: Role.ABOGADO } as any)).rejects.toThrow(NotFoundException);
     });
   });
});
