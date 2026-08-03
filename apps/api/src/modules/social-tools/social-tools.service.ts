import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { RAGService } from '../knowledge/rag.service';
import {
  extractJson,
  asString,
  asStringArray,
  buildRagQuery,
} from '../../common/ai/structured-json.util';
import { GenerateFamilyMapDto } from './dto/generate-family-map.dto';
import { CalculateVulnerabilityDto } from './dto/calculate-vulnerability.dto';
import { MapEnvironmentalDto } from './dto/map-environmental.dto';

export interface EnvironmentalFactor {
  factor: string;
  descripcion: string;
  evidenciaTextual: string;
  severidad: 'BAJO' | 'MEDIO' | 'ALTO';
}

interface EnvironmentalOutput {
  factoresRiesgo: EnvironmentalFactor[];
  recomendaciones: string[];
}

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

  async calculateVulnerability(dto: CalculateVulnerabilityDto, user: AccessUser) {
    // FIX 5 (Fase 0): validar acceso con el usuario REAL (con su role real).
    // Antes se fabricaba un rol hardcodeado ({ role: 'SOCIAL' }).
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, user);
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

  async mapEnvironmental(dto: MapEnvironmentalDto, user: AccessUser) {
    // 1. Acceso validado con el usuario real del request (antes AccessUser falso)
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, user);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    const transcription = await this.prisma.transcription.findUnique({
      where: { id: dto.transcriptionId },
    });

    if (!transcription) {
      throw new NotFoundException('Transcripción no encontrada');
    }

    if (!transcription.text || transcription.text.trim().length === 0) {
      throw new NotFoundException(
        'La transcripción no tiene contenido de texto para analizar',
      );
    }

    // 2. RAG con query derivada del contenido REAL de la transcripción
    //    (corrige el patrón de string fijo de generateFamilyMap)
    const contenido = buildRagQuery(transcription.text);
    const ragQuery = `Factores de riesgo ambientales del hogar y la comunidad, condiciones de vivienda, hacinamiento, consumo, deserción escolar: ${contenido}`;
    const ragChunks = await this.ragService.searchSimilarChunks(ragQuery, 5);

    const ragContext = this.ragService.buildRAGContext(
      ragChunks.map((c) => ({
        content: c.content,
        documentTitle: c.documentTitle,
      })),
    );

    // 3. Prompt → JSON estructurado con evidencia textual por factor
    const systemPrompt = `Eres un trabajador social experto en intervención familiar y comunitaria y en la Ley 548 (Código Niña, Niño y Adolescente) de Bolivia.
Tu tarea es analizar la transcripción de una entrevista y identificar factores de riesgo AMBIENTALES presentes en el relato (por ejemplo: hacinamiento, vivienda precaria, consumo de alcohol/drogas en el hogar, deserción escolar, violencia en el barrio, falta de servicios básicos, trabajo infantil, negligencia).
Reglas:
- Cada factor debe sustentarse con la EVIDENCIA TEXTUAL del relato (cita o paráfrasis breve).
- Clasifica la severidad de cada factor como BAJO, MEDIO o ALTO según lo que el relato indique.
- Tu análisis es un insumo para el informe del trabajador social; no emitas conclusiones definitivas.
- Devuelve SOLO un objeto JSON válido (sin texto adicional) con esta forma exacta:
{
  "factoresRiesgo": [
    { "factor": "nombre del factor", "descripcion": "descripción breve", "evidenciaTextual": "cita o paráfrasis del relato", "severidad": "BAJO|MEDIO|ALTO" }
  ],
  "recomendaciones": ["recomendación 1", "recomendación 2"]
}
Si el relato no menciona factores ambientales de riesgo, devuelve "factoresRiesgo": [] con recomendaciones de verificación.`;

    const userQuery = `Analiza esta transcripción e identifica los factores de riesgo ambientales con su evidencia:

${transcription.text}`;

    const analysisText = await this.ragService.queryOllamaWithRAG(
      userQuery,
      systemPrompt,
      ragContext,
    );

    // 4. Parsear JSON + normalizar (validación de severidad)
    const fallback: EnvironmentalOutput = { factoresRiesgo: [], recomendaciones: [] };
    const parsed = extractJson<EnvironmentalOutput>(analysisText, fallback);
    const parseFallbackUsed = parsed === fallback;

    const factoresRiesgo: EnvironmentalFactor[] = (Array.isArray(parsed.factoresRiesgo)
      ? parsed.factoresRiesgo
      : []
    ).map((f: any) => ({
      factor: asString(f?.factor),
      descripcion: asString(f?.descripcion),
      evidenciaTextual: asString(f?.evidenciaTextual),
      severidad: ['BAJO', 'MEDIO', 'ALTO'].includes(f?.severidad) ? f.severidad : 'MEDIO',
    }));
    const recomendaciones = asStringArray(parsed.recomendaciones);

    const notaMetodologica =
      'Factores identificados por IA a partir del relato, con su evidencia textual. Insumo para la visita domiciliaria y el informe social; debe ser verificado por el trabajador social.';

    // 5. Persistir el mapeo (traza: input/output/analista/fecha)
    const saved = await this.prisma.environmentalMapping.create({
      data: {
        case: { connect: { id: dto.caseId } },
        transcription: { connect: { id: dto.transcriptionId } },
        factoresRiesgo: factoresRiesgo as any,
        recomendaciones: recomendaciones as any,
        notaMetodologica,
        analyst: { connect: { id: user.id } },
      },
    });

    return {
      id: saved.id,
      factoresRiesgo,
      recomendaciones,
      notaMetodologica,
      parseFallbackUsed,
      analyzedAt: saved.analyzedAt.toISOString(),
      analyzedBy: user.id,
      ollamaAnalysis: analysisText,
    };
  }
}
