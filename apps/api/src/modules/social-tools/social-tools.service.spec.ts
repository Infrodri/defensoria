import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { SocialToolsService } from './social-tools.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';

describe('SocialToolsService', () => {
  let service: SocialToolsService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialToolsService,
        {
          provide: PrismaService,
          useValue: {
            transcription: { findUnique: vi.fn() },
          },
        },
        {
          provide: CaseAccessService,
          useValue: {
            assertUserHasAccess: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SocialToolsService>(SocialToolsService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
  });

  describe('generateFamilyMap', () => {
    it('should generate family map successfully', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue({ id: 'trans-123' } as any);

      const result = await service.generateFamilyMap(
        { caseId: 'case-123', transcriptionId: 'trans-123' },
        'user-123',
      );

      expect(result).toBeDefined();
      expect(result.miembros).toHaveLength(2);
    });
  });

  describe('calculateVulnerability', () => {
    it('should calculate vulnerability index correctly', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);

      const result = await service.calculateVulnerability(
        { caseId: 'case-123', ingresos: 800, vivienda: 'Precaria', cargasFamiliares: 2 },
        'user-123',
      );

      expect(result.indiceVulnerabilidad).toBe(95);
      expect(result.programasAplicables).toContain('Bono Familia');
    });
  });

  describe('mapEnvironmental', () => {
    it('should map environmental factors correctly', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue({ id: 'trans-123' } as any);

      const result = await service.mapEnvironmental(
        { caseId: 'case-123', transcriptionId: 'trans-123' },
        'user-123',
      );

      expect(result.factoresRiesgo).toBeDefined();
      expect(result.factoresRiesgo.hacinamiento).toBe(true);
    });
  });
});
