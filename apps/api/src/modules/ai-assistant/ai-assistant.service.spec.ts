import { Test, TestingModule } from '@nestjs/testing';
import { AiAssistantService } from './ai-assistant.service';
import { PrismaService } from '../prisma/prisma.service';
import { EvidenceRagService } from '../evidences/evidence-rag.service';
import { RAGService } from '../knowledge/rag.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '@defensoria/shared';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AiAssistantService', () => {
  let service: AiAssistantService;
  let evidenceRagService: EvidenceRagService;
  let ragService: RAGService;
  let caseAccessService: CaseAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAssistantService,
        {
          provide: PrismaService,
          useValue: {
            systemSetting: { findUnique: vi.fn().mockResolvedValue(null) },
          },
        },
        {
          provide: EvidenceRagService,
          useValue: {
            searchCaseContext: vi.fn().mockResolvedValue('MOCK_CASE_CONTEXT'),
            getCaseDigest: vi.fn().mockResolvedValue('MOCK_DIGEST'),
          },
        },
        {
          provide: RAGService,
          useValue: {
            searchSimilarChunks: vi.fn().mockResolvedValue([{ documentTitle: 'Ley 548', content: 'Mock norm' }]),
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

    service = module.get<AiAssistantService>(AiAssistantService);
    evidenceRagService = module.get<EvidenceRagService>(EvidenceRagService);
    ragService = module.get<RAGService>(RAGService);
    caseAccessService = module.get<CaseAccessService>(CaseAccessService);
    
    // Mock fetch for Ollama
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ response: 'Mock LLM Response' }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('chatGeneral', () => {
    it('nunca invoca a EvidenceRagService, asegurando aislamiento total', async () => {
      const searchSpy = vi.spyOn(evidenceRagService, 'searchCaseContext');
      const getDigestSpy = vi.spyOn(evidenceRagService, 'getCaseDigest');

      await service.chatGeneral('pregunta general', Role.ABOGADO);

      expect(searchSpy).not.toHaveBeenCalled();
      expect(getDigestSpy).not.toHaveBeenCalled();
      expect(ragService.searchSimilarChunks).toHaveBeenCalledTimes(1);
    });
  });

  describe('chatCase', () => {
    it('lanza ForbiddenException si el usuario no tiene acceso al caso', async () => {
      vi.spyOn(caseAccessService, 'assertUserHasAccess').mockRejectedValue(new ForbiddenException('Sin acceso'));
      const searchCaseSpy = vi.spyOn(evidenceRagService, 'searchCaseContext');
      const searchLegalSpy = vi.spyOn(ragService, 'searchSimilarChunks');

      await expect(
        service.chatCase('pregunta', 'case-123', 'user-1', Role.ABOGADO)
      ).rejects.toThrow(ForbiddenException);

      // Verify no internal services are called if access is denied
      expect(searchCaseSpy).not.toHaveBeenCalled();
      expect(searchLegalSpy).not.toHaveBeenCalled();
    });

    it('combina caseDigest, caseContext y legalContext si tiene acceso', async () => {
      vi.spyOn(caseAccessService, 'assertUserHasAccess').mockResolvedValue();

      const response = await service.chatCase('pregunta', 'case-123', 'user-1', Role.ABOGADO);

      expect(caseAccessService.assertUserHasAccess).toHaveBeenCalledWith('case-123', { id: 'user-1', role: Role.ABOGADO, officeId: null });
      expect(evidenceRagService.getCaseDigest).toHaveBeenCalledWith('case-123');
      expect(evidenceRagService.searchCaseContext).toHaveBeenCalledWith('case-123', 'pregunta', 5);
      expect(ragService.searchSimilarChunks).toHaveBeenCalledWith('pregunta', 5);
      expect(response).toBe('Mock LLM Response');
    });

    it('garantiza aislamiento cross-case (Case A no filtra datos de Case B)', async () => {
      vi.spyOn(caseAccessService, 'assertUserHasAccess').mockResolvedValue();
      
      const evidenceSearchSpy = vi.spyOn(evidenceRagService, 'searchCaseContext').mockResolvedValue('CHUNK_FROM_CASE_A');

      await service.chatCase('pregunta sobre caso', 'CASE_A', 'user-1', Role.ABOGADO);

      expect(evidenceSearchSpy).toHaveBeenCalledWith('CASE_A', expect.any(String), expect.any(Number));
      expect(evidenceSearchSpy).not.toHaveBeenCalledWith('CASE_B', expect.any(String), expect.any(Number));
    });
  });
});
