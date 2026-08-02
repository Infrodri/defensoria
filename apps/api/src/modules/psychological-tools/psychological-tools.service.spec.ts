import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { PsychologicalToolsService } from './psychological-tools.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';

describe('PsychologicalToolsService', () => {
  let service: PsychologicalToolsService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PsychologicalToolsService,
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

    service = module.get<PsychologicalToolsService>(PsychologicalToolsService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
  });

  describe('extractIndicators', () => {
    it('should extract indicators successfully', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue({ id: 'trans-123' } as any);

      const result = await service.extractIndicators(
        { caseId: 'case-123', transcriptionId: 'trans-123' },
        { id: 'user-123', role: 'PSICOLOGO' } as any,
      );

      expect(result).toBeDefined();
      expect(result.traumaScore).toBe(78);
    });
  });

  describe('prefillRiskScales', () => {
    it('should prefill risk scales successfully', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue({ id: 'trans-123' } as any);

      const result = await service.prefillRiskScales(
        { caseId: 'case-123', transcriptionId: 'trans-123' },
        'user-123',
      );

      expect(result.escalaSARA).toBeDefined();
      expect(result.evaluacionGlobal).toBe('ALTO');
    });
  });

  describe('translateClinical', () => {
    it('should translate clinical notes to forensic language', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);

      const result = await service.translateClinical(
        { caseId: 'case-123', notesText: 'Paciente se nota temblorosa' },
        'user-123',
      );

      expect(result.forensicTranslation).toContain('estrés agudo');
    });
  });

  describe('analyzeTrauma', () => {
    it('should analyze trauma indicators', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);

      const result = await service.analyzeTrauma(
        { caseId: 'case-123', indicadores: ['Labilidad', 'Aislamiento'] },
        'user-123',
      );

      expect(result.diagnosticoPresuntivo).toBeDefined();
    });
  });
});
