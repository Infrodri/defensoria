import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { ExtractIndicatorsDto } from './dto/extract-indicators.dto';
import { PrefillRiskScalesDto } from './dto/prefill-risk-scales.dto';
import { TranslateClinicalDto } from './dto/translate-clinical.dto';
import { AnalyzeTraumaDto } from './dto/analyze-trauma.dto';

@Injectable()
export class PsychologicalToolsService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  async extractIndicators(dto: ExtractIndicatorsDto, userId: string) {
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, {
        id: userId,
        role: 'PSICOLOGO',
      } as any);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    const transcription = await this.prisma.transcription.findUnique({
      where: { id: dto.transcriptionId },
    });

    if (!transcription) {
      throw new NotFoundException('Transcripción no encontrada');
    }

    return {
      indicadoresDanoEmocional: [
        'Ansiedad elevada ante mención del agresor',
        'Labilidad emocional persistente',
        'Aislamiento social espontáneo',
      ],
      traumaScore: 78,
      nivelAfectacion: 'ALTO',
      recomendacion: 'Iniciar sesiones de contención e intervención psicológica inmediata',
    };
  }

  async prefillRiskScales(dto: PrefillRiskScalesDto, userId: string) {
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, {
        id: userId,
        role: 'PSICOLOGO',
      } as any);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    const transcription = await this.prisma.transcription.findUnique({
      where: { id: dto.transcriptionId },
    });

    if (!transcription) {
      throw new NotFoundException('Transcripción no encontrada');
    }

    return {
      escalaSARA: { nivelRiesgo: 'ALTO', score: 14, factoresCriticos: ['Violencia reciente', 'Amenazas directas'] },
      escalaNVI: { nivelRiesgo: 'MEDIO', score: 8 },
      evaluacionGlobal: 'ALTO',
    };
  }

  async translateClinical(dto: TranslateClinicalDto, userId: string) {
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, {
        id: userId,
        role: 'PSICOLOGO',
      } as any);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    const originalText = dto.notesText;
    const translatedText = `Sujeto presenta indicadores compatibles con cuadro de estrés agudo secundario a vivencia traumática. ${originalText}`;

    return {
      originalNotes: originalText,
      forensicTranslation: translatedText,
      terminologiaLegalRecomendada: ['Impacto psicoemocional', 'Vulnerabilidad psicológica'],
    };
  }

  async analyzeTrauma(dto: AnalyzeTraumaDto, userId: string) {
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, {
        id: userId,
        role: 'PSICOLOGO',
      } as any);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    return {
      indicadoresProcesados: dto.indicadores,
      diagnosticoPresuntivo: 'Trastorno de Estrés Postraumático (TEPT) en fase inicial',
      cronicidad: 'MODERADA',
      planIntervencion: 'Terapia cognitivo-conductual enfocada en trauma',
    };
  }
}
