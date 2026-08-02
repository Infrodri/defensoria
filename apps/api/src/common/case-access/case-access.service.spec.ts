import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CaseAccessService, AccessUser } from './case-access.service';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { Role } from '@prisma/client';

describe('CaseAccessService', () => {
  let service: CaseAccessService;
  let prisma: PrismaService;

  beforeEach(async () => {
    // Mock PrismaService
    const prismaMock = {
      case: {
        findUnique: vi.fn(),
      },
      caseTeamHistory: {
        findFirst: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaseAccessService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<CaseAccessService>(CaseAccessService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const MOCK_CASE_ID = 'case-123';

  describe('assertUserHasAccess', () => {
    
    it('debería rechazar si no hay usuario', async () => {
      await expect(service.assertUserHasAccess(MOCK_CASE_ID, null as any)).rejects.toThrow(ForbiddenException);
    });

    it('ADMINISTRADOR: accede a cualquier caso', async () => {
      const user: AccessUser = { id: 'user-1', role: 'ADMINISTRADOR', officeId: null };
      
      await expect(service.assertUserHasAccess(MOCK_CASE_ID, user)).resolves.not.toThrow();
      expect(prisma.case.findUnique).not.toHaveBeenCalled();
      expect(prisma.caseTeamHistory.findFirst).not.toHaveBeenCalled();
    });

    describe('JEFATURA y SECRETARIA', () => {
      it('JEFATURA: accede si officeId coincide con currentOfficeId del caso', async () => {
        const user: AccessUser = { id: 'user-1', role: 'JEFATURA', officeId: 'office-1' };
        vi.mocked(prisma.case.findUnique).mockResolvedValue({ currentOfficeId: 'office-1' } as any);
        
        await expect(service.assertUserHasAccess(MOCK_CASE_ID, user)).resolves.not.toThrow();
      });

      it('JEFATURA: es rechazado si officeId no coincide', async () => {
        const user: AccessUser = { id: 'user-1', role: 'JEFATURA', officeId: 'office-1' };
        vi.mocked(prisma.case.findUnique).mockResolvedValue({ currentOfficeId: 'office-2' } as any);
        
        await expect(service.assertUserHasAccess(MOCK_CASE_ID, user)).rejects.toThrow(ForbiddenException);
      });

      it('SECRETARIA: accede si officeId coincide con currentOfficeId del caso', async () => {
        const user: AccessUser = { id: 'user-2', role: 'SECRETARIA', officeId: 'office-1' };
        vi.mocked(prisma.case.findUnique).mockResolvedValue({ currentOfficeId: 'office-1' } as any);
        
        await expect(service.assertUserHasAccess(MOCK_CASE_ID, user)).resolves.not.toThrow();
      });

      it('SECRETARIA: es rechazada si officeId no coincide', async () => {
        const user: AccessUser = { id: 'user-2', role: 'SECRETARIA', officeId: 'office-1' };
        vi.mocked(prisma.case.findUnique).mockResolvedValue({ currentOfficeId: 'office-2' } as any);
        
        await expect(service.assertUserHasAccess(MOCK_CASE_ID, user)).rejects.toThrow(ForbiddenException);
      });
    });

    describe('Roles Profesionales de Campo (ABOGADO, PSICOLOGO, SOCIAL)', () => {
      const roles: Role[] = ['ABOGADO', 'PSICOLOGO', 'SOCIAL'];
      
      roles.forEach(role => {
        it(`${role}: accede si tiene fila activa (endDate: null) en CaseTeamHistory`, async () => {
          const user: AccessUser = { id: `user-${role}`, role, officeId: 'office-1' };
          vi.mocked(prisma.caseTeamHistory.findFirst).mockResolvedValue({ id: 'hist-1' } as any);
          
          await expect(service.assertUserHasAccess(MOCK_CASE_ID, user)).resolves.not.toThrow();
          expect(prisma.caseTeamHistory.findFirst).toHaveBeenCalledWith({
            where: { caseId: MOCK_CASE_ID, userId: user.id, endDate: null },
          });
        });

        it(`${role}: es rechazado si tiene fila en CaseTeamHistory pero endDate NO es nulo (histórico)`, async () => {
          const user: AccessUser = { id: `user-${role}`, role, officeId: 'office-1' };
          // El mock retorna null porque la query busca endDate: null y no lo encontraría en DB real
          vi.mocked(prisma.caseTeamHistory.findFirst).mockResolvedValue(null);
          
          await expect(service.assertUserHasAccess(MOCK_CASE_ID, user)).rejects.toThrow(ForbiddenException);
        });

        it(`${role}: es rechazado si no tiene ninguna fila en CaseTeamHistory`, async () => {
          const user: AccessUser = { id: `user-${role}`, role, officeId: 'office-1' };
          vi.mocked(prisma.caseTeamHistory.findFirst).mockResolvedValue(null);
          
          await expect(service.assertUserHasAccess(MOCK_CASE_ID, user)).rejects.toThrow(ForbiddenException);
        });
      });
    });

    describe('Portal de Tutores', () => {
      it('PORTAL: accede si caseCode coincide', async () => {
        const user: AccessUser = { id: MOCK_CASE_ID, role: 'REFERENTE_TUTOR', officeId: null, isPortal: true, caseCode: 'DNA-123' };
        vi.mocked(prisma.case.findUnique).mockResolvedValue({ caseCode: 'DNA-123' } as any);
        
        await expect(service.assertUserHasAccess(MOCK_CASE_ID, user)).resolves.not.toThrow();
      });

      it('PORTAL: es rechazado si caseCode NO coincide', async () => {
        const user: AccessUser = { id: MOCK_CASE_ID, role: 'REFERENTE_TUTOR', officeId: null, isPortal: true, caseCode: 'DNA-123' };
        vi.mocked(prisma.case.findUnique).mockResolvedValue({ caseCode: 'DNA-999' } as any);
        
        await expect(service.assertUserHasAccess(MOCK_CASE_ID, user)).rejects.toThrow(ForbiddenException);
      });

      it('PORTAL: es rechazado si no tiene caseCode en el payload del JWT', async () => {
        // En este caso el payload del jwt no tenía caseCode (malformado)
        const user: AccessUser = { id: MOCK_CASE_ID, role: 'REFERENTE_TUTOR', officeId: null, isPortal: true };
        vi.mocked(prisma.case.findUnique).mockResolvedValue({ caseCode: 'DNA-999' } as any);
        
        await expect(service.assertUserHasAccess(MOCK_CASE_ID, user)).rejects.toThrow(ForbiddenException);
      });
    });

    describe('Roles no contemplados', () => {
      it('Cualquier otro rol: es rechazado por defecto', async () => {
        // Simular un rol inexistente o mal casteado
        const user: AccessUser = { id: 'user-x', role: 'INVALID_ROLE' as any, officeId: 'office-1' };
        
        await expect(service.assertUserHasAccess(MOCK_CASE_ID, user)).rejects.toThrow(ForbiddenException);
      });
    });
  });

  describe('canAccess', () => {
    it('debería retornar false en vez de lanzar error cuando es rechazado (Jefatura de otra oficina)', async () => {
      const user: AccessUser = { id: 'user-1', role: 'JEFATURA', officeId: 'office-1' };
      vi.mocked(prisma.case.findUnique).mockResolvedValue({ currentOfficeId: 'office-2' } as any);
      
      const result = await service.canAccess(MOCK_CASE_ID, user);
      expect(result).toBe(false);
    });

    it('debería retornar false en vez de lanzar error cuando es rechazado (Abogado sin asignación)', async () => {
      const user: AccessUser = { id: 'user-abogado', role: 'ABOGADO', officeId: 'office-1' };
      vi.mocked(prisma.caseTeamHistory.findFirst).mockResolvedValue(null);
      
      const result = await service.canAccess(MOCK_CASE_ID, user);
      expect(result).toBe(false);
    });

    it('debería retornar true cuando accede exitosamente', async () => {
      const user: AccessUser = { id: 'user-1', role: 'ADMINISTRADOR', officeId: null };
      
      const result = await service.canAccess(MOCK_CASE_ID, user);
      expect(result).toBe(true);
    });
  });
});
