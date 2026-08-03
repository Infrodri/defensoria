import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { LegalToolsService } from './legal-tools.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { RAGService } from '../knowledge/rag.service';

describe('LegalToolsService', () => {
  let service: LegalToolsService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;
  let rag: RAGService;

  const user = { id: 'user-123', role: 'ABOGADO', officeId: null } as any;
  const transcription = {
    id: 'trans-123',
    caseId: 'case-123',
    text: 'La niña relata que su padre la golpeó varias veces durante el último año.',
    status: 'COMPLETADA',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalToolsService,
        {
          provide: PrismaService,
          useValue: {
            transcription: { findUnique: vi.fn() },
             discrepancyAnalysis: { findMany: vi.fn(), create: vi.fn() },
             penalTypicityAnalysis: { findMany: vi.fn(), create: vi.fn() },
            processualDeadline: { create: vi.fn() },
            case: { findUnique: vi.fn() },
          },
        },
        {
          provide: CaseAccessService,
          useValue: {
            assertUserHasAccess: vi.fn(),
          },
        },
        {
          provide: RAGService,
          useValue: {
            searchSimilarChunks: vi.fn().mockResolvedValue([]),
            buildRAGContext: vi.fn().mockReturnValue(''),
            queryOllamaWithRAG: vi.fn(),
            queryOllama: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LegalToolsService>(LegalToolsService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
    rag = module.get<RAGService>(RAGService);
  });

  describe('analyzeDiscrepancies', () => {
    it('should analyze discrepancies successfully', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue(transcription);
      vi.spyOn(rag, 'queryOllamaWithRAG').mockResolvedValue(
        'Discrepancia detectada en la fecha del hecho.\n' +
          'La declaración muestra un cambio en la versión de los hechos.\n' +
          'Consistencia general: 80%\n' +
          'Recomendación: contrastar versiones con el acta.',
      );
      vi.spyOn(prisma.discrepancyAnalysis, 'create').mockResolvedValue({
        id: 'analysis-123',
        analyzedAt: new Date(),
        recommendation: 'contrastar versiones con el acta',
      } as any);

      const result = await service.analyzeDiscrepancies(
        { transcriptionId: 'trans-123', caseId: 'case-123' },
        user,
      );

      expect(result).toBeDefined();
      expect(result.discrepancies.length).toBeGreaterThan(0);
      expect(result.consistencyScore).toBe(80);
    });

    it('should throw error if transcription not found', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue(null);

      await expect(
        service.analyzeDiscrepancies(
          { transcriptionId: 'invalid', caseId: 'case-123' },
          user,
        ),
      ).rejects.toThrow('Transcripción no encontrada');
    });
  });

  describe('analyzeTypicality', () => {
    it('should analyze penal typicality and persist', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue(transcription);
      vi.spyOn(rag, 'queryOllamaWithRAG').mockResolvedValue(
        JSON.stringify({
          potentialCrimes: [
            {
              criminalCode: 'Art. 252 CP',
              crimeType: 'Violencia Familiar',
              likelihood: 75,
              fundamento: 'El relato es compatible con violencia física reiterada',
              elementsPresent: ['Golpes', 'Reiteración'],
              elementsMissing: ['Certificado médico forense'],
              proofRequired: ['Certificado médico'],
              suggestedEvidence: ['Informe psicológico'],
            },
          ],
          primaryCrime: 'Violencia Familiar',
          secondaryCrimes: [],
          evidenceGaps: ['Certificado médico forense'],
          investigationPath: 'Solicitar pericia médica',
        }),
      );
      vi.spyOn(prisma.penalTypicityAnalysis, 'create').mockResolvedValue({
        id: 'typ-123',
        analyzedAt: new Date(),
      } as any);

      const result = await service.analyzeTypicality(
        { transcriptionId: 'trans-123', caseTypeCode: 'DENUNCIA_VULNERACION' },
        user,
      );

      expect(result.potentialCrimes).toHaveLength(1);
      expect(result.primaryCrime).toBe('Violencia Familiar');
      expect(result.notaSugerencia).toContain('SUGERENCIA');
      expect(prisma.penalTypicityAnalysis.create).toHaveBeenCalled();
    });
  });

  describe('calculateDeadlines', () => {
    it('should calculate deadlines deterministically with access check', async () => {
      vi.spyOn(prisma.case, 'findUnique').mockResolvedValue({ id: 'case-123' } as any);
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.processualDeadline, 'create').mockResolvedValue({
        id: 'dl-1',
      } as any);

      const result = await service.calculateDeadlines(
        {
          caseId: 'case-123',
          eventDate: '2026-08-05',
          eventType: 'MEDIDAS_PROTECCION' as any,
        },
        user,
      );

      expect(caseAccess.assertUserHasAccess).toHaveBeenCalledWith('case-123', user);
       expect(result.deadlines).toHaveLength(1);
       expect(result.deadlines[0].milestone).toBe('Audiencia Preliminar');
       expect(result.dayType).toBe('CORRIDOS');
       expect(result.alertLevel).toBeDefined();
       expect(result.pendingValidations).toHaveLength(1);
       expect(prisma.processualDeadline.create).toHaveBeenCalled();
     });
   });

   describe('findDiscrepanciesByCaseId (Fase 1)', () => {
     it('should return discrepancy analyses for a case', async () => {
       const mockAnalyses = [
         { id: 'disc-1', caseId: 'case-123', potentialCrimes: ['Violencia Familiar'] },
       ];
       vi.spyOn(prisma.discrepancyAnalysis, 'findMany').mockResolvedValue(mockAnalyses as any);

       const result = await service.findDiscrepanciesByCaseId('case-123');

       expect(prisma.discrepancyAnalysis.findMany).toHaveBeenCalledWith({
         where: { caseId: 'case-123' },
         orderBy: { analyzedAt: 'desc' },
       });
       expect(result).toHaveLength(1);
       expect(result[0].caseId).toBe('case-123');
     });
   });

   describe('findTypicalityByCaseId (Fase 1)', () => {
     it('should return typicity analyses for a case', async () => {
       const mockAnalyses = [
         { id: 'typ-1', caseId: 'case-123', primaryCrime: 'Violencia Familiar' },
       ];
       vi.spyOn(prisma.penalTypicityAnalysis, 'findMany').mockResolvedValue(mockAnalyses as any);

       const result = await service.findTypicalityByCaseId('case-123');

       expect(prisma.penalTypicityAnalysis.findMany).toHaveBeenCalledWith({
         where: { caseId: 'case-123' },
         orderBy: { analyzedAt: 'desc' },
       });
       expect(result).toHaveLength(1);
       expect(result[0].caseId).toBe('case-123');
     });
   });
});
