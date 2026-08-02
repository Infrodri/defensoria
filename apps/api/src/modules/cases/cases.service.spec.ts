import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CasesService } from './cases.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '@defensoria/shared';

describe('CasesService Integration Tests', () => {
  let casesService: CasesService;
  let caseAccessService: CaseAccessService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      case: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
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
    it('SECRETARIA y JEFATURA: debería agregar la cláusula where { currentOfficeId: user.officeId } a Prisma', async () => {
      const user = { id: 'user-1', role: Role.SECRETARIA, officeId: 'office-dist-1' };
      vi.mocked(prisma.case.findMany).mockResolvedValue([]);

      await casesService.findAll(user);

      // Verificamos que la query incluye la cláusula where estricta por oficina
      expect(prisma.case.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { currentOfficeId: 'office-dist-1' },
      }));
    });

    it('ADMINISTRADOR: NO debería agregar cláusula where, consultando todas las oficinas', async () => {
      const user = { id: 'user-admin', role: Role.ADMINISTRADOR, officeId: null };
      vi.mocked(prisma.case.findMany).mockResolvedValue([]);

      await casesService.findAll(user);

      // Verificamos que la query de Administrador NO incluye "where: { currentOfficeId }"
      expect(prisma.case.findMany).toHaveBeenCalledWith(expect.not.objectContaining({
        where: expect.objectContaining({ currentOfficeId: expect.anything() })
      }));
    });
  });
});
