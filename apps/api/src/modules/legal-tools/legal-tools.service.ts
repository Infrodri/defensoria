import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscrepancyRiskLevel } from '@prisma/client';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { RAGService } from '../knowledge/rag.service';
import { AnalyzeDiscrepanciesDto } from './dto/analyze-discrepancies.dto';
import { AnalyzeTypicalityDto } from './dto/analyze-typicality.dto';
import { CalculateDeadlineDto } from './dto/calculate-deadline.dto';

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

  async analyzeTypicality(dto: AnalyzeTypicalityDto, userId: string) {
    // Similar a analyzeDiscrepancies pero para tipicidad penal
    // Placeholder
    return {
      typicalCrimes: [
        {
          criminalCode: 'Art. 252 CP',
          crimeType: 'Violencia Psicológica',
          likelihood: 85,
          elementsPresent: ['Amenazas', 'Menosprecio'],
          elementsMissing: ['Daño psiquiátrico comprobado'],
          proofRequired: ['Informe psicológico', 'Testimonio pericial'],
          suggestedEvidence: ['Prueba de amenazas (WhatsApp)'],
        },
      ],
      primaryCrime: 'Violencia Psicológica',
      secondaryCrimes: [],
      evidenceGaps: ['Informe psicológico forense'],
      investigationPath: 'Solicitar pericia psicológica',
    };
  }

  async calculateDeadlines(dto: CalculateDeadlineDto, userId: string) {
    // Validar caso existe
    const caseData = await this.prisma.case.findUnique({
      where: { id: dto.caseId },
    });

    if (!caseData) {
      throw new NotFoundException('Caso no encontrado');
    }

    // Calcular vencimientos
    const eventDate = new Date(dto.eventDate);
    const deadlines = [];

    if (dto.eventType === 'MEDIDAS_PROTECCION') {
      // Audia preliminar en 5 días
      const audienciaDate = new Date(eventDate);
      audienciaDate.setDate(audienciaDate.getDate() + 5);
      deadlines.push({
        milestone: 'Audiencia Preliminar',
        calculatedDate: audienciaDate,
        daysRemaining: Math.ceil((audienciaDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        status: 'EN_TIEMPO',
        urgency: 60,
        relatedLaws: ['Ley 548', 'Art. 102'],
      });
    }

    return {
      deadlines,
      alertLevel: 'VERDE',
      actionItems: ['Notificar a partes', 'Preparar audiencia'],
    };
  }
}
