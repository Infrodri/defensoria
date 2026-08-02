import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { RAGService } from '../knowledge/rag.service';
import { GenerateFamilyMapDto } from './dto/generate-family-map.dto';
import { CalculateVulnerabilityDto } from './dto/calculate-vulnerability.dto';
import { MapEnvironmentalDto } from './dto/map-environmental.dto';

@Injectable()
export class SocialToolsService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
    private ragService: RAGService,
  ) {}

  async generateFamilyMap(dto: GenerateFamilyMapDto, user: AccessUser) {
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, user);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    const transcription = dto.transcriptionId
      ? await this.prisma.transcription.findUnique({
          where: { id: dto.transcriptionId },
        })
      : null;

    if (!transcription) {
      return this.generateExampleFamilyMap(dto.caseId);
    }

    // Buscar documentos sobre estructura familiar
    const ragChunks = await this.ragService.searchSimilarChunks(
      'Estructura familiar, dinámicas familiares, relaciones, familiograma, vulnerabilidad familiar',
      5,
    );

    const ragContext = this.ragService.buildRAGContext(
      ragChunks.map((c) => ({
        content: c.content,
        documentTitle: c.documentTitle,
      })),
    );

    const systemPrompt = `Eres un trabajador social experto en intervención familiar y Ley 548 (Código Niña, Niño y Adolescente) de Bolivia.
Tu tarea es analizar la transcripción para identificar:
- Miembros de la familia y sus relaciones
- Dinámicas familiares
- Factores de vulnerabilidad familiar
- Recursos de apoyo existentes
- Recomendaciones de intervención social`;

    const userQuery = `Analiza la estructura y dinámicas familiares en esta transcripción:

${transcription.text}`;

    const analysis = await this.ragService.queryOllamaWithRAG(
      userQuery,
      systemPrompt,
      ragContext,
    );

    return {
      miembros: this.extractFamilyMembers(analysis),
      dinamicas: this.extractDynamics(analysis),
      vulnerabilidades: this.extractVulnerabilities(analysis),
      recomendaciones: this.extractRecommendations(analysis),
      analisisCompleto: analysis,
    };
  }

  private generateExampleFamilyMap(caseId: string) {
    return {
      miembros: [
        { nombre: 'Madre', relacion: 'Madre', vulnerabilidades: ['Desempleo', 'Carga económica'] },
        { nombre: 'NNA (principal)', relacion: 'Hijo/a', vulnerabilidades: ['Exposición a conflicto familiar'] },
      ],
      dinamicas: [
        'Factor identificado: conflicto',
        'Factor identificado: comunicación',
      ],
      vulnerabilidades: ['pobreza', 'vivienda precaria'],
      recomendaciones: [
        'Análisis de ejemplo — Realizar visita domiciliaria para evaluación completa.',
        'Para análisis real, sube una transcripción de audio de la entrevista.',
      ],
      analisisCompleto: 'Datos de ejemplo generados por el sistema (sin transcripción).',
    };
  }

  private extractFamilyMembers(text: string): any[] {
    const members = [];
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('padre') || lines[i].includes('madre') || lines[i].includes('hermano')) {
        members.push({
          nombre: `Miembro ${members.length + 1}`,
          relacion: this.extractRelation(lines[i]),
          vulnerabilidades: [],
        });
      }
    }
    return members.length > 0 ? members : [{ nombre: 'Ver análisis completo', relacion: 'Familia', vulnerabilidades: [] }];
  }

  private extractRelation(line: string): string {
    if (line.includes('padre')) return 'Padre';
    if (line.includes('madre')) return 'Madre';
    if (line.includes('hermano')) return 'Hermano/a';
    return 'Familiar';
  }

  private extractDynamics(text: string): string[] {
    const dynamics = [];
    const keywords = ['conflicto', 'comunicación', 'violencia', 'apoyo', 'desvinculación'];
    for (const keyword of keywords) {
      if (text.toLowerCase().includes(keyword)) {
        dynamics.push(`Factor identificado: ${keyword}`);
      }
    }
    return dynamics.slice(0, 3);
  }

  private extractVulnerabilities(text: string): string[] {
    const vulnerabilities = [];
    const keywords = ['pobreza', 'desempleo', 'vivienda precaria', 'enfermedad', 'adicción'];
    for (const keyword of keywords) {
      if (text.toLowerCase().includes(keyword)) {
        vulnerabilities.push(keyword);
      }
    }
    return vulnerabilities;
  }

  private extractRecommendations(text: string): string[] {
    const recs = [];
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes('recomendar') || line.includes('sugerir') || line.includes('intervención')) {
        recs.push(line.trim().substring(0, 100));
      }
    }
    return recs.slice(0, 3);
  }

  async calculateVulnerability(dto: CalculateVulnerabilityDto, userId: string) {
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, {
        id: userId,
        role: 'SOCIAL',
      } as any);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    let baseIndex = 50;
    if (dto.ingresos < 1000) baseIndex += 20;
    if (dto.vivienda === 'Precaria') baseIndex += 15;
    baseIndex += dto.cargasFamiliares * 5;

    return {
      indiceVulnerabilidad: Math.min(baseIndex, 100),
      programasAplicables: ['Bono Familia', 'Subsidio Vivienda']
    };
  }

  async mapEnvironmental(dto: MapEnvironmentalDto, userId: string) {
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, {
        id: userId,
        role: 'SOCIAL',
      } as any);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    const transcription = dto.transcriptionId
      ? await this.prisma.transcription.findUnique({
          where: { id: dto.transcriptionId },
        })
      : null;

    if (!transcription) {
      return {
        factoresRiesgo: {
          hacinamiento: true,
          consumo: false,
          desercionEscolar: true,
        },
        recomendaciones: [
          'Análisis de ejemplo — Visita domiciliaria.',
          'Seguimiento escolar.',
          'Para análisis real, sube una transcripción de audio.',
        ],
      };
    }

    return {
      factoresRiesgo: {
        hacinamiento: true,
        consumo: false,
        desercionEscolar: true
      },
      recomendaciones: ['Visita domiciliaria', 'Intervención escolar']
    };
  }
}
