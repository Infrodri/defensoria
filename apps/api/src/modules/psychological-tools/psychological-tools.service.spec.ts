import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { PsychologicalToolsService } from './psychological-tools.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { RAGService } from '../knowledge/rag.service';

describe('PsychologicalToolsService', () => {
  let service: PsychologicalToolsService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;
  let rag: RAGService;

  const user = { id: 'user-123', role: 'PSICOLOGO', officeId: null } as any;
  const transcription = {
    id: 'trans-123',
    caseId: 'case-123',
    text: 'El niño relata que su padrastro lo golpea y amenaza de muerte. Duerme poco desde los hechos.',
    status: 'COMPLETADA',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PsychologicalToolsService,
        {
          provide: PrismaService,
          useValue: {
            transcription: { findUnique: vi.fn() },
            riskScaleAnalysis: { create: vi.fn() },
            clinicalTranslation: { create: vi.fn() },
            traumaAnalysis: { create: vi.fn() },
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

    service = module.get<PsychologicalToolsService>(PsychologicalToolsService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
    rag = module.get<RAGService>(RAGService);
  });

  describe('extractIndicators', () => {
    it('should extract indicators successfully', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue(transcription);
      vi.spyOn(rag, 'queryOllamaWithRAG').mockResolvedValue(
        'Indicadores:\n- Manifestaciones de ansiedad durante la entrevista\n' +
          '- Evitación al hablar sobre el incidente\n' +
          'Score de trauma: 80\nNivel: MEDIO\nRecomendación: derivar a evaluación completa',
      );

      const result = await service.extractIndicators(
        { caseId: 'case-123', transcriptionId: 'trans-123' },
        user,
      );

      expect(result).toBeDefined();
      expect(result.traumaScore).toBe(80);
      expect(result.indicadores.length).toBeGreaterThan(0);
    });
  });

  describe('prefillRiskScales', () => {
    it('should extract evidence per item and compute score deterministically', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue(transcription);
      vi.spyOn(rag, 'queryOllamaWithRAG').mockResolvedValue(
        JSON.stringify({
          items: [
            { key: 'violencia_reciente', presente: true, evidenciaTextual: 'lo golpea' },
            { key: 'amenazas_directas', presente: true, evidenciaTextual: 'amenaza de muerte' },
            { key: 'exposicion_nna', presente: true, evidenciaTextual: 'el niño relata' },
          ],
        }),
      );
      vi.spyOn(prisma.riskScaleAnalysis, 'create').mockResolvedValue({
        id: 'rs-1',
        analyzedAt: new Date(),
      } as any);

      const result = await service.prefillRiskScales(
        { caseId: 'case-123', transcriptionId: 'trans-123' },
        user,
      );

      // SARA: violencia_reciente (2) + amenazas_directas (2) = 4 → MEDIO
      expect(result.escalaSARA.score).toBe(4);
      expect(result.escalaSARA.nivelRiesgo).toBe('MEDIO');
      expect(result.escalaSARA.factoresCriticos).toContain('Violencia física reciente');
      // NVI: exposicion_nna (1) = 1 → BAJO
      expect(result.escalaNVI.score).toBe(1);
      expect(result.escalaNVI.nivelRiesgo).toBe('BAJO');
      expect(result.evaluacionGlobal).toBe('MEDIO');
      expect(result.pendingValidations.length).toBeGreaterThan(0);
      expect(prisma.riskScaleAnalysis.create).toHaveBeenCalled();
    });
  });

  describe('translateClinical', () => {
    it('should translate clinical notes to forensic language preserving facts', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(rag, 'queryOllama').mockResolvedValue(
        JSON.stringify({
          forensicTranslation:
            'La paciente refiere temblor persistente durante la entrevista, sin otra sintomatología observada.',
          terminologiaLegalRecomendada: ['Impacto psicoemocional'],
        }),
      );
      vi.spyOn(prisma.clinicalTranslation, 'create').mockResolvedValue({
        id: 'ct-1',
        createdAt: new Date(),
      } as any);

      const result = await service.translateClinical(
        { caseId: 'case-123', notesText: 'Paciente se nota temblorosa' },
        user,
      );

      expect(result.forensicTranslation).toContain('temblor');
      expect(result.originalNotes).toBe('Paciente se nota temblorosa');
      expect(result.advertencia).toBeDefined();
      expect(prisma.clinicalTranslation.create).toHaveBeenCalled();
    });
  });

  describe('analyzeTrauma', () => {
    it('should analyze trauma indicators as clinical hypothesis', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(rag, 'queryOllamaWithRAG').mockResolvedValue(
        JSON.stringify({
          patronExposicion: 'Exposición reiterada a violencia física en el hogar',
          cronicidad: 'MODERADA',
          hipotesisClinica: 'Compatible con sintomatología de estrés postraumático; requiere confirmación clínica',
          recomendaciones: ['Evaluación psicológica completa'],
        }),
      );
      vi.spyOn(prisma.traumaAnalysis, 'create').mockResolvedValue({
        id: 'ta-1',
        analyzedAt: new Date(),
      } as any);

      const result = await service.analyzeTrauma(
        { caseId: 'case-123', indicadores: ['Labilidad', 'Aislamiento'] },
        user,
      );

      expect(result.indicadoresProcesados).toEqual(['Labilidad', 'Aislamiento']);
      expect(result.hipotesisClinica).toContain('requiere confirmación');
      expect(result.advertencia).toContain('no constituye diagnóstico');
      expect(prisma.traumaAnalysis.create).toHaveBeenCalled();
    });
  });
});
