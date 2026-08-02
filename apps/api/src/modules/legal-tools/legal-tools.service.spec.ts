import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { LegalToolsService } from './legal-tools.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';

describe('LegalToolsService', () => {
  let service: LegalToolsService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalToolsService,
        {
          provide: PrismaService,
          useValue: {
            transcription: { findUnique: vi.fn() },
            discrepancyAnalysis: { create: vi.fn() },
            case: { findUnique: vi.fn() },
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

    service = module.get<LegalToolsService>(LegalToolsService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
  });

  describe('analyzeDiscrepancies', () => {
    it('should analyze discrepancies successfully', async () => {
      const userId = 'user-123';
      const dto = {
        transcriptionId: 'trans-123',
        caseId: 'case-123',
      };

      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue({ id: 'trans-123' } as any);
      vi.spyOn(prisma.discrepancyAnalysis, 'create').mockResolvedValue({ id: 'analysis-123' } as any);

      const result = await service.analyzeDiscrepancies(dto, userId);

      expect(result).toBeDefined();
      expect(result.discrepancies).toBeDefined();
    });

    it('should throw error if transcription not found', async () => {
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue(null);

      await expect(
        service.analyzeDiscrepancies({ transcriptionId: 'invalid', caseId: 'case-123' }, 'user-123'),
      ).rejects.toThrow('Transcripción no encontrada');
    });
  });

  describe('calculateDeadlines', () => {
    it('should calculate deadlines correctly', async () => {
      vi.spyOn(prisma.case, 'findUnique').mockResolvedValue({ id: 'case-123' } as any);

      const result = await service.calculateDeadlines(
        {
          caseId: 'case-123',
          eventDate: '2026-08-05',
          eventType: 'MEDIDAS_PROTECCION' as any,
        },
        'user-123',
      );

      expect(result.deadlines).toBeDefined();
      expect(result.alertLevel).toBe('VERDE');
    });
  });
});
