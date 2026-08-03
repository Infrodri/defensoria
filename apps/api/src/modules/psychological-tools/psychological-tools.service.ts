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
import { ExtractIndicatorsDto } from './dto/extract-indicators.dto';
import { PrefillRiskScalesDto } from './dto/prefill-risk-scales.dto';
import { TranslateClinicalDto } from './dto/translate-clinical.dto';
import { AnalyzeTraumaDto } from './dto/analyze-trauma.dto';

type RiskLevel = 'BAJO' | 'MEDIO' | 'ALTO';

interface RiskScaleItem {
  scale: 'SARA' | 'NVI';
  key: string;
  label: string;
  weight: number;
  pendingValidation: boolean;
}

interface RiskItemEvidence {
  key: string;
  presente: boolean;
  evidenciaTextual: string;
}

interface RiskScalesOutput {
  items: RiskItemEvidence[];
}

interface TraumaOutput {
  patronExposicion: string;
  cronicidad: string;
  hipotesisClinica: string;
  recomendaciones: string[];
}

@Injectable()
export class PsychologicalToolsService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
    private ragService: RAGService,
  ) {}

  async extractIndicators(dto: ExtractIndicatorsDto, user: AccessUser) {
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
      return this.generateExampleIndicators(dto.caseId, user.id);
    }

    // Buscar documentos sobre indicadores de trauma
    const ragChunks = await this.ragService.searchSimilarChunks(
      'Indicadores de trauma, síntomas TEPT, daño emocional, comportamiento víctima',
      5,
    );

    const ragContext = this.ragService.buildRAGContext(
      ragChunks.map((c) => ({
        content: c.content,
        documentTitle: c.documentTitle,
      })),
    );

    const systemPrompt = `Eres un psicólogo clínico experto en trauma infantil y Ley 548 (Código Niña, Niño y Adolescente) de Bolivia.
Tu tarea es analizar la transcripción de una entrevista para identificar indicadores de trauma, estrés post-traumático y daño emocional.
Proporciona:
- Indicadores de daño emocional encontrados
- Score de trauma (0-100)
- Nivel de afectación (BAJO, MEDIO, ALTO)
- Recomendación de intervención
- Urgencia de atención psicológica`;

    const userQuery = `Extrae indicadores de trauma de esta transcripción:

${transcription.text}`;

    const analysis = await this.ragService.queryOllamaWithRAG(
      userQuery,
      systemPrompt,
      ragContext,
    );

    return {
      indicadores: this.extractIndicatorsList(analysis),
      traumaScore: this.extractScore(analysis),
      nivelAfectacion: this.extractLevel(analysis),
      recomendacion: this.extractRecommendation(analysis),
      analisisCompleto: analysis,
    };
  }

  private generateExampleIndicators(caseId: string, userId: string) {
    return {
      indicadores: [
        'Manifestaciones de ansiedad durante la entrevista',
        'Evitación al hablar sobre el incidente',
        'Alteraciones en el patrón de sueño reportadas',
        'Signos de hipervigilancia y respuesta de sobresalto',
      ],
      traumaScore: 65,
      nivelAfectacion: 'MEDIO',
      recomendacion:
        'Análisis de ejemplo — Derivar a evaluación psicológica completa. Para análisis real, sube una transcripción de audio de la entrevista.',
      analisisCompleto: 'Datos de ejemplo generados por el sistema (sin transcripción).',
    };
  }

  private extractIndicatorsList(text: string): string[] {
    const indicators = [];
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes('-') || line.includes('•')) {
        const clean = line.replace(/[-•*]/g, '').trim();
        if (clean.length > 10) indicators.push(clean);
      }
    }
    return indicators.slice(0, 5);
  }

  private extractScore(text: string): number {
    const match = text.match(/(\d+)/);
    if (match) {
      const score = parseInt(match[1]);
      return Math.min(100, Math.max(0, score));
    }
    return 65;
  }

  private extractLevel(text: string): string {
    if (text.includes('ALTO')) return 'ALTO';
    if (text.includes('BAJO')) return 'BAJO';
    return 'MEDIO';
  }

  private extractRecommendation(text: string): string {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes('recomend') || line.includes('suger')) {
        return line.substring(0, 300);
      }
    }
    return 'Seguimiento psicológico recomendado';
  }

  /**
   * Ítems CANDIDATOS para las escalas de riesgo, basados en los dominios
   * estándar de SARA (S/A/R/A) y en la escala NVI usada en contexto de
   * violencia intrafamiliar.
   *
   * PENDIENTE: la versión exacta del instrumento usado por el equipo clínico
   * NO está documentada en el código. Cada ítem, su peso y los umbrales de
   * nivel de riesgo quedan marcados como pendientes de validación con el
   * equipo clínico. El LLM solo extrae la EVIDENCIA textual; el score se
   * calcula de forma determinística (no lo genera el modelo).
   */
  private readonly RISK_SCALE_ITEMS: RiskScaleItem[] = [
    { scale: 'SARA', key: 'violencia_reciente', label: 'Violencia física reciente', weight: 2, pendingValidation: true },
    { scale: 'SARA', key: 'amenazas_directas', label: 'Amenazas de violencia o muerte', weight: 2, pendingValidation: true },
    { scale: 'SARA', key: 'control_coercitivo', label: 'Control coercitivo / aislamiento', weight: 1, pendingValidation: true },
    { scale: 'SARA', key: 'acceso_armas', label: 'Acceso a armas', weight: 2, pendingValidation: true },
    { scale: 'SARA', key: 'consumo_sustancias', label: 'Consumo problemático de alcohol o drogas', weight: 1, pendingValidation: true },
    { scale: 'SARA', key: 'escalada_violencia', label: 'Escalada de violencia o frecuencia creciente', weight: 1, pendingValidation: true },
    { scale: 'NVI', key: 'violencia_fisica_hogar', label: 'Episodios de violencia física en el hogar', weight: 1, pendingValidation: true },
    { scale: 'NVI', key: 'violencia_psicologica', label: 'Violencia psicológica / maltrato verbal', weight: 1, pendingValidation: true },
    { scale: 'NVI', key: 'exposicion_nna', label: 'Exposición del NNA a la violencia', weight: 1, pendingValidation: true },
  ];

  /**
   * Umbrales de nivel de riesgo por escala (score = suma de pesos de los
   * ítems presentes). PROPUESTA pendiente de validación con el equipo clínico.
   */
  private readonly RISK_LEVEL_THRESHOLDS: Record<'SARA' | 'NVI', { bajo: number; medio: number }> = {
    SARA: { bajo: 2, medio: 4 },
    NVI: { bajo: 1, medio: 2 },
  };

  async prefillRiskScales(dto: PrefillRiskScalesDto, user: AccessUser) {
    // 1. Acceso validado con el usuario real del request (antes se usaba un
    //    AccessUser falso con rol hardcodeado)
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
    const contenido = buildRagQuery(transcription.text);
    const ragQuery = `Escalas de riesgo SARA/NVI, violencia intrafamiliar, control coercitivo, acceso a armas: ${contenido}`;
    const ragChunks = await this.ragService.searchSimilarChunks(ragQuery, 5);

    const ragContext = this.ragService.buildRAGContext(
      ragChunks.map((c) => ({
        content: c.content,
        documentTitle: c.documentTitle,
      })),
    );

    // 3. El LLM SOLO extrae evidencia textual por ítem (JSON estructurado).
    //    El score y el nivel de riesgo los calcula la fórmula determinística.
    const catalogJson = JSON.stringify(
      this.RISK_SCALE_ITEMS.map((i) => ({ key: i.key, label: i.label })),
    );

    const systemPrompt = `Eres un psicólogo forense experto en evaluación de riesgo de violencia y en la Ley 548 (Código Niña, Niño y Adolescente) de Bolivia.
Tu tarea es analizar la transcripción de una entrevista y buscar EVIDENCIA TEXTUAL para cada ítem de las escalas SARA y NVI.
Reglas:
- NO calcules scores ni niveles de riesgo: tu único trabajo es identificar si el relato contiene evidencia que sustente cada ítem y citar o parafrasear brevemente esa evidencia.
- Si un ítem no aparece en el relato, marca "presente": false con evidencia vacía.
- Devuelve SOLO un objeto JSON válido (sin texto adicional) con esta forma exacta:
{ "items": [ { "key": "<clave del ítem>", "presente": true/false, "evidenciaTextual": "cita o paráfrasis breve del relato" } ] }
Usa únicamente estas claves válidas: ${catalogJson}`;

    const userQuery = `Analiza esta transcripción y extrae la evidencia por ítem de riesgo:

${transcription.text}`;

    const analysisText = await this.ragService.queryOllamaWithRAG(
      userQuery,
      systemPrompt,
      ragContext,
    );

    // 4. Parsear JSON + calcular score determinístico por escala
    const fallback: RiskScalesOutput = { items: [] };
    const parsed = extractJson<RiskScalesOutput>(analysisText, fallback);
    const parseFallbackUsed = parsed === fallback;

    const evidenceByKey = new Map<string, RiskItemEvidence>();
    for (const item of Array.isArray(parsed.items) ? parsed.items : []) {
      if (item && typeof item.key === 'string') {
        evidenceByKey.set(item.key, {
          key: item.key,
          presente: item.presente === true,
          evidenciaTextual: asString(item.evidenciaTextual),
        });
      }
    }

    const escalaSARA = this.computeScaleResult('SARA', evidenceByKey);
    const escalaNVI = this.computeScaleResult('NVI', evidenceByKey);
    const evaluacionGlobal = this.maxLevel(escalaSARA.nivelRiesgo, escalaNVI.nivelRiesgo);

    const pendingValidations = [
      'PENDIENTE: requiere validación con equipo clínico — los ítems, pesos y umbrales de SARA/NVI son una propuesta (dominios estándar) y deben confirmarse contra el instrumento oficial usado por el equipo.',
    ];

    // 5. Persistir el análisis (traza: input/output/analista/fecha)
    const saved = await this.prisma.riskScaleAnalysis.create({
      data: {
        case: { connect: { id: dto.caseId } },
        transcription: { connect: { id: dto.transcriptionId } },
        scaleResults: {
          sara: escalaSARA,
          nvi: escalaNVI,
          evaluacionGlobal,
        } as any,
        pendingValidations,
        analyst: { connect: { id: user.id } },
      },
    });

    return {
      id: saved.id,
      escalaSARA,
      escalaNVI,
      evaluacionGlobal,
      pendingValidations,
      parseFallbackUsed,
      analyzedAt: saved.analyzedAt.toISOString(),
      analyzedBy: user.id,
      ollamaAnalysis: analysisText,
    };
  }

  async translateClinical(dto: TranslateClinicalDto, user: AccessUser) {
    // 1. Acceso validado con el usuario real del request (también usaba el
    //    AccessUser falso con rol hardcodeado)
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, user);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    if (!dto.notesText || dto.notesText.trim().length === 0) {
      throw new NotFoundException('No hay notas clínicas para traducir');
    }

    // 2. LLM directo (sin RAG): traducir a lenguaje forense preservando los
    //    hechos, sin agregar interpretaciones que el profesional no escribió
    const systemPrompt = `Eres un redactor pericial experto en psicología forense y en la Ley 548 (Código Niña, Niño y Adolescente) de Bolivia.
Tu tarea es traducir las notas clínicas de un profesional a lenguaje forense/técnico.
Reglas:
- Preserva EXACTAMENTE los hechos y observaciones que el profesional escribió. NO agregues diagnósticos, interpretaciones clínicas ni conclusiones que no estén en el texto original.
- Usa terminología técnica forense (ej. "impacto psicoemocional", "vulnerabilidad psicológica") solo donde el texto lo sustente.
- Devuelve SOLO un objeto JSON válido (sin texto adicional) con esta forma exacta:
{ "forensicTranslation": "texto traducido", "terminologiaLegalRecomendada": ["término 1", "término 2"] }`;

    const userQuery = `Traduce las siguientes notas clínicas a lenguaje forense preservando los hechos:

${dto.notesText}`;

    const analysisText = await this.ragService.queryOllama(systemPrompt, userQuery);

    // 3. Parsear JSON; si el modelo responde en prosa (sin JSON), esa prosa
    //    sigue siendo la traducción y se devuelve tal cual.
    const parsed = extractJson<{ forensicTranslation?: string; terminologiaLegalRecomendada?: string[] }>(
      analysisText,
      {},
    );
    const parseFallbackUsed = Object.keys(parsed).length === 0;

    const forensicTranslation = asString(parsed.forensicTranslation, analysisText.trim()) ||
      dto.notesText;
    const terminologiaLegalRecomendada = asStringArray(parsed.terminologiaLegalRecomendada);
    const advertencia = parseFallbackUsed
      ? 'La respuesta del modelo no llegó en formato JSON; se devuelve el texto generado tal cual. Revisar manualmente antes de su uso.'
      : 'Traducción generada por IA: preserva los hechos escritos por el profesional y no agrega interpretaciones clínicas.';

    // 4. Persistir la traducción (traza)
    const saved = await this.prisma.clinicalTranslation.create({
      data: {
        case: { connect: { id: dto.caseId } },
        originalText: dto.notesText,
        translatedText: forensicTranslation,
        terminology: terminologiaLegalRecomendada as any,
        creator: { connect: { id: user.id } },
      },
    });

    return {
      id: saved.id,
      originalNotes: dto.notesText,
      forensicTranslation,
      terminologiaLegalRecomendada,
      advertencia,
      createdAt: saved.createdAt.toISOString(),
      createdBy: user.id,
      ollamaAnalysis: analysisText,
    };
  }

  async analyzeTrauma(dto: AnalyzeTraumaDto, user: AccessUser) {
    // 1. Acceso validado con el usuario real del request (antes AccessUser falso)
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, user);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    // 2. Usar los indicadores REALES del DTO (pensados para encadenarse con
    //    extractIndicators), no un diagnóstico fijo hardcodeado
    const indicadores = asStringArray(dto.indicadores);

    // 3. RAG con query derivada de los indicadores reales + contexto de
    //    trauma infantil / Ley 548
    const contenido = buildRagQuery(indicadores.join(', '));
    const ragQuery = `Trauma acumulado en la niñez, exposición a situaciones de violencia, indicadores de daño emocional: ${contenido || 'sin indicadores específicos'}`;
    const ragChunks = await this.ragService.searchSimilarChunks(ragQuery, 5);

    const ragContext = this.ragService.buildRAGContext(
      ragChunks.map((c) => ({
        content: c.content,
        documentTitle: c.documentTitle,
      })),
    );

    // 4. Prompt con framing de HIPÓTESIS clínica para revisión del
    //    profesional (nunca un diagnóstico cerrado)
    const systemPrompt = `Eres un psicólogo clínico experto en trauma infantil y en la Ley 548 (Código Niña, Niño y Adolescente) de Bolivia.
Tu tarea es analizar una lista de indicadores de daño emocional y describir el patrón de exposición y cronicidad.
IMPORTANTE: tu análisis es una HIPÓTESIS clínica para que el profesional psicólogo la revise y valide. NO emitas diagnósticos; usa lenguaje de "compatible con", "sugiere evaluar", "requiere confirmación clínica". Nunca presentes un cuadro como un hecho cerrado.
Devuelve SOLO un objeto JSON válido (sin texto adicional) con esta forma exacta:
{
  "patronExposicion": "descripción del patrón de exposición a situaciones adversas",
  "cronicidad": "hipótesis sobre cronicidad: AGUDA | MODERADA | CRONICA o descripción",
  "hipotesisClinica": "hipótesis de trabajo en lenguaje clínico, como sugerencia de evaluación",
  "recomendaciones": ["recomendación 1", "recomendación 2"]
}
Si la lista de indicadores está vacía, devuélvelo igual con una nota en patronExposicion indicando que faltan indicadores para un análisis sustantivo.`;

    const userQuery = `Indicadores de daño emocional identificados:
${indicadores.length > 0 ? indicadores.map((i) => `- ${i}`).join('\n') : '(sin indicadores en el request)'}

Analiza el patrón de exposición y cronicidad como hipótesis clínica.`;

    const analysisText = await this.ragService.queryOllamaWithRAG(
      userQuery,
      systemPrompt,
      ragContext,
    );

    // 5. Parsear JSON + normalizar
    const fallback: TraumaOutput = {
      patronExposicion: '',
      cronicidad: '',
      hipotesisClinica: '',
      recomendaciones: [],
    };
    const parsed = extractJson<TraumaOutput>(analysisText, fallback);
    const parseFallbackUsed = parsed === fallback;

    const resultado: TraumaOutput = {
      patronExposicion: asString(parsed.patronExposicion),
      cronicidad: asString(parsed.cronicidad),
      hipotesisClinica: asString(parsed.hipotesisClinica),
      recomendaciones: asStringArray(parsed.recomendaciones),
    };

    const advertencia =
      'Hipótesis clínica generada por IA: describe un patrón COMPATIBLE con los indicadores, pero no constituye diagnóstico. Requiere evaluación y validación del profesional psicólogo.';

    // 6. Persistir el análisis (traza)
    const saved = await this.prisma.traumaAnalysis.create({
      data: {
        case: { connect: { id: dto.caseId } },
        indicadores: indicadores as any,
        patronExposicion: resultado.patronExposicion,
        cronicidad: resultado.cronicidad,
        hipotesisClinica: resultado.hipotesisClinica,
        recomendaciones: resultado.recomendaciones,
        advertencia,
        analyst: { connect: { id: user.id } },
      },
    });

    return {
      id: saved.id,
      indicadoresProcesados: indicadores,
      patronExposicion: resultado.patronExposicion,
      cronicidad: resultado.cronicidad,
      hipotesisClinica: resultado.hipotesisClinica,
      recomendaciones: resultado.recomendaciones,
      advertencia,
      parseFallbackUsed,
      analyzedAt: saved.analyzedAt.toISOString(),
      analyzedBy: user.id,
      ollamaAnalysis: analysisText,
    };
  }

  // ── Read methods (Fase 1) ──────────────────────────────────────

  async findRiskScalesByCaseId(caseId: string) {
    return this.prisma.riskScaleAnalysis.findMany({
      where: { caseId },
      orderBy: { analyzedAt: 'desc' },
    });
  }

  async findClinicalTranslationsByCaseId(caseId: string) {
    return this.prisma.clinicalTranslation.findMany({
      where: { caseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTraumaAnalysesByCaseId(caseId: string) {
    return this.prisma.traumaAnalysis.findMany({
      where: { caseId },
      orderBy: { analyzedAt: 'desc' },
    });
  }

  // ── Helpers determinísticos (el score NO lo genera el LLM) ────────────────

  private computeScaleResult(
    scale: 'SARA' | 'NVI',
    evidenceByKey: Map<string, RiskItemEvidence>,
  ): {
    nivelRiesgo: RiskLevel;
    score: number;
    items: Array<{ key: string; label: string; presente: boolean; evidenciaTextual: string }>;
    factoresCriticos: string[];
  } {
    const items = this.RISK_SCALE_ITEMS
      .filter((item) => item.scale === scale)
      .map((item) => {
        const evidencia = evidenceByKey.get(item.key);
        const presente = evidencia?.presente === true;
        return {
          key: item.key,
          label: item.label,
          weight: item.weight,
          presente,
          evidenciaTextual: presente ? asString(evidencia?.evidenciaTextual) : '',
        };
      });

    const score = items.reduce(
      (acc, item) => acc + (item.presente ? item.weight : 0),
      0,
    );

    const { bajo, medio } = this.RISK_LEVEL_THRESHOLDS[scale];
    const nivelRiesgo: RiskLevel = score <= bajo ? 'BAJO' : score <= medio ? 'MEDIO' : 'ALTO';

    const factoresCriticos = items
      .filter((item) => item.presente && item.weight >= 2)
      .map((item) => item.label);

    return { nivelRiesgo, score, items, factoresCriticos };
  }

  private maxLevel(a: RiskLevel, b: RiskLevel): RiskLevel {
    const order: Record<RiskLevel, number> = { BAJO: 0, MEDIO: 1, ALTO: 2 };
    return order[a] >= order[b] ? a : b;
  }
}
