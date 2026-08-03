import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { SocialToolsService } from './social-tools.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { RAGService } from '../knowledge/rag.service';

describe('SocialToolsService', () => {
  let service: SocialToolsService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;
  let rag: RAGService;

  const user = { id: 'user-123', role: 'SOCIAL', officeId: null } as any;
  const transcription = {
    id: 'trans-123',
    caseId: 'case-123',
    text: 'La madre indica que viven seis personas en dos habitaciones y que el padre consume alcohol a diario.',
    status: 'COMPLETADA',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialToolsService,
        {
          provide: PrismaService,
          useValue: {
            transcription: { findUnique: vi.fn() },
            environmentalMapping: { create: vi.fn() },
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

    service = module.get<SocialToolsService>(SocialToolsService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
    rag = module.get<RAGService>(RAGService);
  });

  describe('generateFamilyMap', () => {
    it('should generate family map successfully', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue(transcription);
      vi.spyOn(rag, 'queryOllamaWithRAG').mockResolvedValue(
        'La madre y el padre viven con el niño.\nEl padre trabaja fuera de la ciudad.',
      );

      const result = await service.generateFamilyMap(
        { caseId: 'case-123', transcriptionId: 'trans-123' },
        user,
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
    it('should map environmental factors with textual evidence', async () => {
      vi.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      vi.spyOn(prisma.transcription, 'findUnique').mockResolvedValue(transcription);
      vi.spyOn(rag, 'queryOllamaWithRAG').mockResolvedValue(
        JSON.stringify({
          factoresRiesgo: [
            {
              factor: 'Hacinamiento',
              descripcion: 'Seis personas en dos habitaciones',
              evidenciaTextual: 'viven seis personas en dos habitaciones',
              severidad: 'ALTO',
            },
            {
              factor: 'Consumo de alcohol en el hogar',
              descripcion: 'Consumo diario del padre',
              evidenciaTextual: 'el padre consume alcohol a diario',
              severidad: 'MEDIO',
            },
          ],
          recomendaciones: ['Visita domiciliaria', 'Intervención con el padre'],
        }),
      );
      vi.spyOn(prisma.environmentalMapping, 'create').mockResolvedValue({
        id: 'em-1',
        analyzedAt: new Date(),
      } as any);

      const result = await service.mapEnvironmental(
        { caseId: 'case-123', transcriptionId: 'trans-123' },
        user,
      );

      expect(result.factoresRiesgo).toHaveLength(2);
      expect(result.factoresRiesgo[0].factor).toBe('Hacinamiento');
      expect(result.factoresRiesgo[0].evidenciaTextual).toContain('seis personas');
      expect(result.notaMetodologica).toBeDefined();
      expect(prisma.environmentalMapping.create).toHaveBeenCalled();
    });
  });
});
