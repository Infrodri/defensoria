import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DiscrepancyRiskLevel,
  ProcessualStatus,
  ProcessualAlertLevel,
} from '@prisma/client';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { RAGService } from '../knowledge/rag.service';
import {
  extractJson,
  asString,
  asNumber,
  asStringArray,
  clamp,
  buildRagQuery,
} from '../../common/ai/structured-json.util';
import { AnalyzeDiscrepanciesDto } from './dto/analyze-discrepancies.dto';
import { AnalyzeTypicalityDto } from './dto/analyze-typicality.dto';
import { CalculateDeadlineDto } from './dto/calculate-deadline.dto';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface PotentialCrime {
  criminalCode: string;
  crimeType: string;
  likelihood: number;
  fundamento: string;
  elementsPresent: string[];
  elementsMissing: string[];
  proofRequired: string[];
  suggestedEvidence: string[];
}

interface TypicalityResult {
  potentialCrimes: PotentialCrime[];
  primaryCrime: string;
  secondaryCrimes: string[];
  evidenceGaps: string[];
  investigationPath: string;
}

interface DeadlineRule {
  milestone: string;
  offsetDays: number; // días CORRIDOS desde eventDate
  relatedLaws: string[];
  pendingValidation?: string;
}

@Injectable()
export class LegalToolsService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
    private ragService: RAGService,
  ) {}

  async analyzeDiscrepancies(
    dto: AnalyzeDiscrepanciesDto,
    user: AccessUser,
  ) {
    // 1. Validar acceso al caso
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, user);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    // 2. Si no hay transcriptionId, intentar obtener la última del caso
    let transcriptionId = dto.transcriptionId;
    if (!transcriptionId) {
      const latestTranscription = await this.prisma.transcription.findFirst({
        where: { caseId: dto.caseId, status: 'COMPLETADA' },
        orderBy: { createdAt: 'desc' },
      });

      if (latestTranscription) {
        transcriptionId = latestTranscription.id;
      } else {
        // Si no hay transcripción, usar datos de ejemplo (análisis de prueba)
        return this.generateExampleAnalysis(dto.caseId, user.id);
      }
    }

    // 3. Verificar que la transcripción existe
    const transcription = await this.prisma.transcription.findUnique({
      where: { id: transcriptionId },
    });

    if (!transcription) {
      throw new NotFoundException(
        'Transcripción no encontrada. Por favor, sube un audio de la entrevista primero.',
      );
    }

    // 4. Si aún no está transcrita, usar el texto que proporcionó
    if (!transcription.text || transcription.status !== 'COMPLETADA') {
      throw new BadRequestException(
        'La transcripción aún se está procesando o no se completó. Intenta más tarde.',
      );
    }

    const transcriptionContent = transcription.text;

    // 4. Buscar documentos legales relevantes en la base de conocimiento
    const ragChunks = await this.ragService.searchSimilarChunks(
      `Análisis de discrepancias, inconsistencias testimoniales, entrevista, interrogatorio`,
      5,
    );

    const ragContext = this.ragService.buildRAGContext(
      ragChunks.map((c) => ({
        content: c.content,
        documentTitle: c.documentTitle,
      })),
    );

    // 5. Consultar Ollama con RAG para análisis real
    const systemPrompt = `Eres un abogado experto en entrevistas forense con experiencia en Ley 548 (Código Niña, Niño y Adolescente) de Bolivia.
Tu tarea es analizar la transcripción de una entrevista para identificar discrepancias, inconsistencias o cambios en los testimonios.
Proporciona un análisis estructurado con:
- Discrepancias identificadas
- Severidad de cada discrepancia (BAJA, MEDIA, ALTA)
- Implicaciones legales
- Preguntas sugeridas para aclarar
- Score de consistencia general (0-100)
- Recomendación legal`;

    const userQuery = `Analiza esta transcripción e identifica discrepancias:

${transcriptionContent}`;

    const analysisText = await this.ragService.queryOllamaWithRAG(
      userQuery,
      systemPrompt,
      ragContext,
    );

    // 6. Parsear respuesta de Ollama
    const discrepancies = this.parseDiscrepancies(analysisText);
    const consistencyScore = this.extractConsistencyScore(analysisText);
    const riskLevel =
      consistencyScore < 60
        ? DiscrepancyRiskLevel.ALTO
        : consistencyScore < 80
          ? DiscrepancyRiskLevel.MEDIO
          : DiscrepancyRiskLevel.BAJO;

    // 7. Guardar análisis en BD
    const saved = await this.prisma.discrepancyAnalysis.create({
      data: {
        case: { connect: { id: dto.caseId } },
        currentTranscription: { connect: { id: transcriptionId } },
        comparableDocumentIds: dto.comparableDocuments || [],
        discrepancies: discrepancies,
        consistencyScore: consistencyScore,
        riskLevel: riskLevel,
        recommendation: this.extractRecommendation(analysisText),
        analyst: { connect: { id: user.id } },
      },
    });

    return {
      id: saved.id,
      discrepancies: discrepancies,
      consistencyScore: consistencyScore,
      riskLevel: riskLevel,
      recommendation: saved.recommendation,
      analyzedAt: saved.analyzedAt.toISOString(),
      analyzedBy: user.id,
      ollamaAnalysis: analysisText,
    };
  }

  private generateExampleAnalysis(caseId: string, userId: string) {
    return {
      id: `example-${caseId}-${Date.now()}`,
      discrepancies: [
        {
          id: 'd-example-1',
          category: 'Temporal',
          severity: 'MEDIA',
          currentStatement: 'Fecha del incidente reportada como enero',
          previousStatement: 'Fecha del incidente reportada como febrero',
          implications: 'Posible confusión temporal en la declaración',
          suggestedQuestion: '¿Podría confirmar la fecha exacta del incidente?',
        },
        {
          id: 'd-example-2',
          category: 'Personas presentes',
          severity: 'BAJA',
          currentStatement: 'Se encontraba solo en el momento',
          previousStatement: 'Había un adulto presente',
          implications: 'Variación en los presentes durante el hecho',
          suggestedQuestion: '¿Había alguien más en el lugar al momento del hecho?',
        },
      ],
      consistencyScore: 75,
      riskLevel: 'MEDIO',
      recommendation:
        'Análisis de ejemplo — Para análisis real, sube una transcripción de audio de la entrevista.',
      analyzedAt: new Date().toISOString(),
      analyzedBy: userId,
      ollamaAnalysis: 'Datos de ejemplo generados por el sistema (sin transcripción).',
    };
  }

  private parseDiscrepancies(text: string): any[] {
    // Parser simple para extraer discrepancias del texto de Ollama
    const discrepancies = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.includes('discrepancia') ||
        line.includes('inconsistencia') ||
        line.includes('cambio')
      ) {
        const severityMatch = line.match(/(BAJA|MEDIA|ALTA)/i);
        const severity = severityMatch ? severityMatch[1].toUpperCase() : 'MEDIA';
        
        discrepancies.push({
          id: `d-${discrepancies.length + 1}`,
          category: line.substring(0, 100),
          severity: severity,
          currentStatement: 'Según Ollama',
          previousStatement: 'Análisis completo en ollamaAnalysis',
          implications: line.substring(0, 150),
          suggestedQuestion: 'Ver análisis completo',
        });
      }
    }

    return discrepancies.length > 0
      ? discrepancies
      : [
          {
            id: 'd-1',
            category: 'Análisis de Ollama',
            severity: 'MEDIA',
            currentStatement: 'Ver análisis completo',
            previousStatement: 'Procesado por IA',
            implications: text.substring(0, 200),
            suggestedQuestion: 'Consultar con especialista',
          },
        ];
  }

  private extractConsistencyScore(text: string): number {
    const scoreMatch = text.match(/(\d+)%|score.*?(\d+)/i);
    if (scoreMatch) {
      return Math.min(100, Math.max(0, parseInt(scoreMatch[1] || scoreMatch[2])));
    }
    return 75; // Default si no se encuentra
  }

  private extractRecommendation(text: string): string {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes('recomend') || line.includes('suger')) {
        return line.substring(0, 300);
      }
    }
    return 'Revisar análisis completo generado por IA';
  }

  /**
   * Tabla de reglas determinística para vencimientos procesales.
   * NO se usa LLM para calcular plazos: son plazos legales exactos y deben
   * ser constantes revisadas por el equipo legal.
   *
   * Nota metodológica: los valores aún no validados se marcan con
   * `pendingValidation` y NO se inventan plazos. El paso recomendado es
   * extraer los plazos de la Ley 548 una sola vez (RAG offline, fuera de la
   * request), validarlos con un abogado del equipo y dejarlos aquí como
   * constantes. Ver: apps/api/src/scripts/seed-ley548.ts (texto base).
   */
  private readonly DEADLINE_RULES: Record<string, DeadlineRule[]> = {
    MEDIDAS_PROTECCION: [
      {
        milestone: 'Audiencia Preliminar',
        // Valor conservado del comportamiento previo (5 días corridos).
        // No está validado contra la Ley 548.
        offsetDays: 5,
        relatedLaws: ['Ley 548'],
        pendingValidation:
          'PENDIENTE: requiere validación de abogado — verificar el plazo legal exacto para la audiencia en medidas de protección (Ley 548). El valor actual (5 días corridos) se conserva del comportamiento anterior y no está validado.',
      },
    ],
    // Sin plazos definidos en código ni en la base de conocimiento (el seed
    // de la Ley 548 solo trae artículos 1-4). No se inventan valores.
    AUDIENCIA: [],
    DENUNCIA: [],
  };

  private readonly EVENT_ACTION_ITEMS: Record<string, string[]> = {
    MEDIDAS_PROTECCION: ['Notificar a las partes', 'Preparar audiencia preliminar'],
    AUDIENCIA: ['Verificar asistencia de las partes', 'Preparar expediente para audiencia'],
    DENUNCIA: ['Ratificar denuncia', 'Recolectar pruebas iniciales'],
  };

  async analyzeTypicality(dto: AnalyzeTypicalityDto, user: AccessUser) {
    // 1. El DTO no trae caseId: el caso se deriva de la transcripción
    const transcription = await this.prisma.transcription.findUnique({
      where: { id: dto.transcriptionId },
    });

    if (!transcription) {
      throw new NotFoundException(
        'Transcripción no encontrada. Sube una transcripción de la entrevista primero.',
      );
    }

    if (!transcription.text || transcription.text.trim().length === 0) {
      throw new BadRequestException(
        'La transcripción no tiene contenido de texto para analizar.',
      );
    }

    // 2. Acceso validado con el usuario real del request
    try {
      await this.caseAccessService.assertUserHasAccess(transcription.caseId, user);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    // 3. RAG con query derivada del contenido REAL del relato + tipo de caso
    //    (corrige el patrón de string fijo de analyzeDiscrepancies)
    const contenidoRelato = buildRagQuery(transcription.text);
    const ragQuery = `Tipicidad penal, delitos contra niñas, niños y adolescentes, tipo de caso ${dto.caseTypeCode}: ${contenidoRelato}`;
    const ragChunks = await this.ragService.searchSimilarChunks(ragQuery, 5);

    const ragContext = this.ragService.buildRAGContext(
      ragChunks.map((c) => ({
        content: c.content,
        documentTitle: c.documentTitle,
      })),
    );

    // 4. Prompt que pide JSON estructurado (se parsea, no se extrae por regex)
    const systemPrompt = `Eres un abogado penalista experto en la Ley 548 (Código Niña, Niño y Adolescente) de Bolivia y el Código Penal.
Tu tarea es analizar el relato de una niña, niño o adolescente y proponer posibles tipos penales aplicables.
IMPORTANTE: tu salida es una SUGERENCIA de tipicidad para que el abogado del caso la revise; nunca la presentes como conclusión jurídica definitiva. No afirmes que un delito "se configuró"; usa lenguaje de "compatible con" o "sugiere evaluar".
Devuelve SOLO un objeto JSON válido (sin texto adicional) con esta forma exacta:
{
  "potentialCrimes": [
    {
      "criminalCode": "Art. N CP",
      "crimeType": "Nombre del delito",
      "likelihood": 0-100,
      "fundamento": "Texto corto que justifica la compatibilidad con elementos del relato",
      "elementsPresent": ["elemento presente en el relato"],
      "elementsMissing": ["elemento que faltaría confirmar"],
      "proofRequired": ["prueba necesaria"],
      "suggestedEvidence": ["evidencia sugerida"]
    }
  ],
  "primaryCrime": "delito principal propuesto",
  "secondaryCrimes": ["otro delito"],
  "evidenceGaps": ["falta de información relevante"],
  "investigationPath": "ruta de investigación sugerida"
}
Si el relato no alcanza para proponer tipos penales, devuelve la estructura con "potentialCrimes": [] y explica los vacíos en "evidenceGaps".`;

    const userQuery = `Tipo de caso: ${dto.caseTypeCode}
Relato del NNA:
${transcription.text}`;

    const analysisText = await this.ragService.queryOllamaWithRAG(
      userQuery,
      systemPrompt,
      ragContext,
    );

    // 5. Parsear JSON con validación + fallback conservador
    const fallback: TypicalityResult = {
      potentialCrimes: [],
      primaryCrime: '',
      secondaryCrimes: [],
      evidenceGaps: [],
      investigationPath: '',
    };
    const parsed = extractJson<TypicalityResult>(analysisText, fallback);
    const normalized = this.normalizeTypicality(parsed);
    const parseFallbackUsed = parsed === fallback;

    // 6. Persistir para trazabilidad (input/output/analista/fecha)
    const saved = await this.prisma.penalTypicityAnalysis.create({
      data: {
        case: { connect: { id: transcription.caseId } },
        transcription: { connect: { id: dto.transcriptionId } },
        potentialCrimes: normalized.potentialCrimes as any,
        primaryCrime: normalized.primaryCrime,
        secondaryCrimes: normalized.secondaryCrimes,
        evidenceGaps: normalized.evidenceGaps,
        investigationPath: normalized.investigationPath,
        analyst: { connect: { id: user.id } },
      },
    });

    return {
      id: saved.id,
      potentialCrimes: normalized.potentialCrimes,
      primaryCrime: normalized.primaryCrime,
      secondaryCrimes: normalized.secondaryCrimes,
      evidenceGaps: normalized.evidenceGaps,
      investigationPath: normalized.investigationPath,
      notaSugerencia:
        'Resultado generado por IA como SUGERENCIA de tipicidad penal. Debe ser revisado y validado por un abogado antes de utilizarse en el expediente.',
      parseFallbackUsed,
      analyzedAt: saved.analyzedAt.toISOString(),
      analyzedBy: user.id,
      ollamaAnalysis: analysisText,
    };
  }

  async calculateDeadlines(dto: CalculateDeadlineDto, user: AccessUser) {
    // 1. El caso debe existir
    const caseData = await this.prisma.case.findUnique({
      where: { id: dto.caseId },
    });

    if (!caseData) {
      throw new NotFoundException('Caso no encontrado');
    }

    // 2. Acceso validado con el usuario real del request (antes solo se
    //    validaba la existencia del caso)
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, user);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    // 3. Cálculo determinístico desde la tabla de reglas (NO LLM)
    const rules = this.DEADLINE_RULES[dto.eventType] || [];
    const eventDate = new Date(dto.eventDate);
    if (Number.isNaN(eventDate.getTime())) {
      throw new BadRequestException('Fecha de evento inválida');
    }

    const now = new Date();
    const deadlines = rules.map((rule) => {
      const calculatedDate = new Date(eventDate);
      calculatedDate.setDate(calculatedDate.getDate() + rule.offsetDays);

      const daysRemaining = Math.ceil(
        (calculatedDate.getTime() - now.getTime()) / MS_PER_DAY,
      );
      const status: ProcessualStatus =
        daysRemaining < 0 ? 'VENCIDO' : daysRemaining <= 3 ? 'PROXIMO' : 'EN_TIEMPO';
      const urgency = this.computeUrgency(daysRemaining);
      const alertLevel = this.alertLevelForUrgency(urgency);

      return {
        milestone: rule.milestone,
        calculatedDate,
        daysRemaining,
        status,
        urgency,
        alertLevel,
        relatedLaws: rule.relatedLaws,
      };
    });

    // 4. Persistir cada hito calculado (trazabilidad)
    const savedIds: string[] = [];
    for (const deadline of deadlines) {
      const saved = await this.prisma.processualDeadline.create({
        data: {
          case: { connect: { id: dto.caseId } },
          milestone: deadline.milestone,
          calculatedDate: deadline.calculatedDate,
          daysRemaining: deadline.daysRemaining,
          status: deadline.status,
          urgency: deadline.urgency,
          alertLevel: deadline.alertLevel,
          relatedLaws: deadline.relatedLaws,
          creator: { connect: { id: user.id } },
        },
      });
      savedIds.push(saved.id);
    }

    // 5. Pendientes de validación de negocio (plazos de ley no validados)
    const pendingValidations: string[] = [];
    for (const rule of rules) {
      if (rule.pendingValidation) pendingValidations.push(rule.pendingValidation);
    }
    if (rules.length === 0) {
      pendingValidations.push(
        `PENDIENTE: requiere validación de abogado — no hay plazos definidos para el tipo de evento "${dto.eventType}". ` +
          'Extraer los plazos de la Ley 548 (RAG offline, fuera de la request), validarlos con el equipo legal y registrarlos en DEADLINE_RULES.',
      );
    }

    return {
      eventType: dto.eventType,
      dayType: 'CORRIDOS', // los offsets de DEADLINE_RULES son días corridos
      deadlines: deadlines.map((d, i) => ({ ...d, id: savedIds[i] })),
      alertLevel: this.aggregateAlertLevel(deadlines.map((d) => d.alertLevel)),
      actionItems: this.EVENT_ACTION_ITEMS[dto.eventType] || [],
      pendingValidations,
    };
  }

  private normalizeTypicality(raw: TypicalityResult): TypicalityResult {
    const crimes = Array.isArray(raw.potentialCrimes) ? raw.potentialCrimes : [];
    const potentialCrimes: PotentialCrime[] = crimes.map((c: any) => ({
      criminalCode: asString(c?.criminalCode),
      crimeType: asString(c?.crimeType),
      likelihood: clamp(Math.round(asNumber(c?.likelihood)), 0, 100),
      fundamento: asString(c?.fundamento),
      elementsPresent: asStringArray(c?.elementsPresent),
      elementsMissing: asStringArray(c?.elementsMissing),
      proofRequired: asStringArray(c?.proofRequired),
      suggestedEvidence: asStringArray(c?.suggestedEvidence),
    }));

    return {
      potentialCrimes,
      primaryCrime: asString(raw.primaryCrime),
      secondaryCrimes: asStringArray(raw.secondaryCrimes),
      evidenceGaps: asStringArray(raw.evidenceGaps),
      investigationPath: asString(raw.investigationPath),
    };
  }

  /**
   * Urgencia determinística (0-100) según días restantes.
   * Valores de umbral razonables, revisables por el equipo legal.
   */
  private computeUrgency(daysRemaining: number): number {
    if (daysRemaining <= 0) return 95;
    if (daysRemaining <= 3) return 80;
    if (daysRemaining <= 7) return 60;
    if (daysRemaining <= 15) return 40;
    return 20;
  }

  private alertLevelForUrgency(urgency: number): ProcessualAlertLevel {
    if (urgency >= 80) return 'ROJO';
    if (urgency >= 50) return 'AMARILLO';
    return 'VERDE';
  }

  private aggregateAlertLevel(levels: ProcessualAlertLevel[]): ProcessualAlertLevel {
    if (levels.includes('ROJO')) return 'ROJO';
    if (levels.includes('AMARILLO')) return 'AMARILLO';
    return 'VERDE';
  }
}
