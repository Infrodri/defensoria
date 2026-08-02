import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscrepancyRiskLevel } from '@prisma/client';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { AnalyzeDiscrepanciesDto } from './dto/analyze-discrepancies.dto';
import { AnalyzeTypicalityDto } from './dto/analyze-typicality.dto';
import { CalculateDeadlineDto } from './dto/calculate-deadline.dto';

@Injectable()
export class LegalToolsService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  async analyzeDiscrepancies(
    dto: AnalyzeDiscrepanciesDto,
    userId: string,
  ) {
    // 1. Validar acceso al caso
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, {
        id: userId,
        role: 'ABOGADO', // Este será reemplazado por el decorator @CurrentUser
      } as any);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    // 2. Verificar que la transcripción existe
    const transcription = await this.prisma.transcription.findUnique({
      where: { id: dto.transcriptionId },
    });

    if (!transcription) {
      throw new NotFoundException('Transcripción no encontrada');
    }

    // 3. Realizar análisis (placeholder - aquí iría lógica Ollama)
    const analysisResult = {
      discrepancies: [
        {
          category: 'FECHA',
          severity: 'MEDIA',
          currentStatement: 'El hecho ocurrió el 5 de agosto',
          previousStatement: 'El hecho ocurrió el 6 de agosto',
          implications: 'Podría afectar credibilidad del testimonio',
          suggestedQuestion: '¿Puede confirmar exactamente qué día ocurrió?',
        },
      ],
      consistencyScore: 85,
      riskLevel: DiscrepancyRiskLevel.BAJO,
      recommendation: 'Validar fechas exactas en próxima audiencia',
    };

    // 4. Guardar análisis en BD
    const saved = await this.prisma.discrepancyAnalysis.create({
      data: {
        caseId: dto.caseId,
        currentTranscriptionId: dto.transcriptionId,
        comparableDocumentIds: dto.comparableDocuments || [],
        discrepancies: analysisResult.discrepancies,
        consistencyScore: analysisResult.consistencyScore,
        riskLevel: analysisResult.riskLevel,
        recommendation: analysisResult.recommendation,
        analyzedBy: userId,
      },
    });

    return {
      id: saved.id,
      ...analysisResult,
    };
  }

  async analyzeTypicality(dto: AnalyzeTypicalityDto, userId: string) {
    // Similar a analyzeDiscrepancies pero para tipicidad penal
    // Placeholder
    return {
      potentialCrimes: [
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
