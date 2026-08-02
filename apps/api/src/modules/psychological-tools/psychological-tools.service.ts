import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { RAGService } from '../knowledge/rag.service';
import { ExtractIndicatorsDto } from './dto/extract-indicators.dto';
import { PrefillRiskScalesDto } from './dto/prefill-risk-scales.dto';
import { TranslateClinicalDto } from './dto/translate-clinical.dto';
import { AnalyzeTraumaDto } from './dto/analyze-trauma.dto';

@Injectable()
export class PsychologicalToolsService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
    private ragService: RAGService,
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
