import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvidenceRagService } from '../evidence-rag.service';

describe('EvidenceRagService - Semantic RAG Tagging (<mapa_actores>)', () => {
  let service: EvidenceRagService;
  let mockPrisma: any;
  let mockEmbeddings: any;

  beforeEach(() => {
    mockPrisma = {
      case: {
        findUnique: vi.fn(),
      },
      $queryRaw: vi.fn(),
      $executeRaw: vi.fn(),
    };

    mockEmbeddings = {
      getEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.1)),
    };

    service = new EvidenceRagService(mockPrisma, mockEmbeddings);
  });

  describe('getCaseActorMap', () => {
    it('should return XML <mapa_actores> with victima and denunciado_presunto_agresor tags', async () => {
      // Calculate a birthDate for a 12-year-old child relative to today
      const today = new Date();
      const birthDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());

      mockPrisma.case.findUnique.mockResolvedValue({
        id: '11111111-1111-1111-1111-111111111111',
        parties: [
          {
            roleInCase: 'NNA',
            person: {
              firstName: 'Juan',
              lastName: 'Perez',
              birthDate,
            },
            nnaContext: {
              schoolGrade: '6to de Primaria',
              schoolName: 'Escuela Bolivia',
              livesWithDescription: 'Vive con la madre',
            },
          },
          {
            roleInCase: 'DENUNCIADO',
            relationship: 'Padrastro',
            occupation: 'Comerciante',
            person: {
              firstName: 'Pedro',
              lastName: 'Ramos',
              birthDate: null,
            },
          },
        ],
      });

      const xml = await service.getCaseActorMap('11111111-1111-1111-1111-111111111111');

      expect(xml).toContain('<mapa_actores>');
      expect(xml).toContain('<victima>');
      expect(xml).toContain('<nombre>Juan Perez</nombre>');
      expect(xml).toContain('<edad>12</edad>');
      expect(xml).toContain('<escolaridad>6to de Primaria - Escuela Bolivia</escolaridad>');
      expect(xml).toContain('<vive_con>Vive con la madre</vive_con>');
      expect(xml).toContain('</victima>');
      expect(xml).toContain('<denunciado_presunto_agresor>');
      expect(xml).toContain('<nombre>Pedro Ramos</nombre>');
      expect(xml).toContain('<vinculo_con_victima>Padrastro</vinculo_con_victima>');
      expect(xml).toContain('<ocupacion>Comerciante</ocupacion>');
      expect(xml).toContain('</denunciado_presunto_agresor>');
      expect(xml).toContain('</mapa_actores>');
    });

    it('should return empty <mapa_actores> XML if case or parties are missing', async () => {
      mockPrisma.case.findUnique.mockResolvedValue(null);

      const xml = await service.getCaseActorMap('non-existent-id');
      expect(xml).toBe('<mapa_actores>\n</mapa_actores>');
    });
  });

  describe('searchCaseContext', () => {
    it('should prepend <mapa_actores> and <relato_hechos> to retrieved case chunks', async () => {
      mockPrisma.case.findUnique.mockImplementation(async ({ include, select }: any) => {
        if (select?.intakeNarrative) {
          return { intakeNarrative: 'Relato inicial de los hechos reportados.' };
        }
        if (include?.parties) {
          return {
            id: '11111111-1111-1111-1111-111111111111',
            parties: [
              {
                roleInCase: 'NNA',
                person: {
                  firstName: 'Juan',
                  lastName: 'Perez',
                  birthDate: null,
                },
              },
            ],
          };
        }
        return null;
      });

      mockPrisma.$queryRaw.mockResolvedValue([
        {
          content: 'Transcripción del testimonio inicial del menor.',
          sourceType: 'audio_transcript',
          metadata: {},
        },
      ]);

      const result = await service.searchCaseContext('11111111-1111-1111-1111-111111111111', 'testimonio');

      expect(result).toContain('<mapa_actores>');
      expect(result).toContain('<victima>');
      expect(result).toContain('<nombre>Juan Perez</nombre>');
      expect(result).toContain('<relato_hechos>');
      expect(result).toContain('Relato inicial de los hechos reportados.');
      expect(result).toContain('🎙️ Transcripción de audio:');
      expect(result).toContain('Transcripción del testimonio inicial del menor.');
    });
  });
});
