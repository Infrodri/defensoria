import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CasesService } from './cases.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Role, Phase, InterventionPath } from '@defensoria/shared';

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
          create: vi.fn().mockResolvedValue({ id: 'cth-new', caseId: 'case-1', role: Role.ABOGADO, userId: 'user-target', endDate: null, assignedBy: 'user-assigner', reason: undefined }),
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
          create: vi.fn().mockResolvedValue({ id: 'cth-new' }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue({ id: 'user-target', role: Role.PSICOLOGO }),
        },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx));

      const dto = { userId: 'user-target', role: Role.PSICOLOGO };
      
      await expect(casesService.assignTeam('case-1', dto, 'user-assigner')).resolves.toBeDefined();
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
        $queryRaw: vi.fn().mockResolvedValue([{ nextval: 42 }]),
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx));
      vi.mocked(caseAccessService.assertUserHasAccess).mockResolvedValue(undefined);

      const dto = { 
        nnaId: 'nna-1', 
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
});
