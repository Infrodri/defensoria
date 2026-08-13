import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AiConfigDto {
  textModel: string;
  embeddingModel: string;
  whisperEndpoint: string;
  whisperModel: string;
  ocrEndpoint: string;
  ocrModel: string;
}

@Injectable()
export class AiConfigService {
  private readonly logger = new Logger(AiConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getConfig(): Promise<AiConfigDto> {
    const keys = ['AI_MODEL_TEXT', 'AI_MODEL_EMBEDDING', 'AI_WHISPER_ENDPOINT', 'AI_WHISPER_MODEL', 'AI_OCR_ENDPOINT', 'AI_OCR_MODEL'];
    const settings = await this.prisma.systemSetting.findMany({
      where: { key: { in: keys } },
    });

    const map = new Map(settings.map(s => [s.key, s.value]));

    return {
      textModel: map.get('AI_MODEL_TEXT') || 'qwen2.5:7b',
      embeddingModel: map.get('AI_MODEL_EMBEDDING') || 'nomic-embed-text',
      whisperEndpoint: map.get('AI_WHISPER_ENDPOINT') || 'http://localhost:8000/v1/audio/transcriptions',
      whisperModel: map.get('AI_WHISPER_MODEL') || 'whisper-1',
      ocrEndpoint: map.get('AI_OCR_ENDPOINT') || 'http://localhost:8000/v1/vision',
      ocrModel: map.get('AI_OCR_MODEL') || 'llama3.2-vision',
    };
  }

  async updateConfig(dto: AiConfigDto, userId: string) {
    const updates = [
      { key: 'AI_MODEL_TEXT', value: dto.textModel },
      { key: 'AI_MODEL_EMBEDDING', value: dto.embeddingModel },
      { key: 'AI_WHISPER_ENDPOINT', value: dto.whisperEndpoint },
      { key: 'AI_WHISPER_MODEL', value: dto.whisperModel },
      { key: 'AI_OCR_ENDPOINT', value: dto.ocrEndpoint },
      { key: 'AI_OCR_MODEL', value: dto.ocrModel },
    ];

    for (const item of updates) {
      await this.prisma.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value, updatedBy: userId },
        create: {
          key: item.key,
          value: item.value,
          description: `Configuración IA: ${item.key}`,
          updatedBy: userId,
        },
      });
    }

    return { success: true };
  }

  async getLocalModels() {
    try {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await fetch(`${ollamaUrl}/api/tags`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.models.map((m: any) => m.name);
    } catch (e) {
      this.logger.warn('No se pudo conectar con Ollama local');
      return [];
    }
  }

  async getHealth() {
    const results = {
      whisper: 'unknown' as 'ok' | 'degraded' | 'unknown',
      ocr: 'unknown' as 'ok' | 'degraded' | 'unknown',
      ollama: 'unknown' as 'ok' | 'degraded' | 'unknown',
    };

    // Check Ollama
    try {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      const ollamaRes = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
      results.ollama = ollamaRes.ok ? 'ok' : 'degraded';
    } catch {
      results.ollama = 'degraded';
    }

    // Check Whisper
    try {
      const whisperUrl = await this.getWhisperUrl();
      if (!whisperUrl) {
        results.whisper = 'unknown'; // Desactivado intencionalmente
      } else {
        const whisperRes = await fetch(`${whisperUrl}/health`, { signal: AbortSignal.timeout(3000) });
        results.whisper = whisperRes.ok ? 'ok' : 'degraded';
      }
    } catch {
      results.whisper = 'degraded';
    }

    // Check OCR
    try {
      const ocrModel = await this.getOcrModel();
      if (!ocrModel) {
        results.ocr = 'unknown'; // Desactivado intencionalmente
      } else {
        const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        const ollamaRes = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
        if (ollamaRes.ok) {
          const data = await ollamaRes.json();
          const hasVisionModel = data.models.some((m: any) => m.name === ocrModel || m.name.includes(ocrModel));
          results.ocr = hasVisionModel ? 'ok' : 'degraded';
        } else {
          results.ocr = 'degraded';
        }
      }
    } catch {
      results.ocr = 'degraded';
    }

    return results;
  }

  async startServices() {
    const results: { whisper: string; ocr: string; ollama: string } = { whisper: 'starting', ocr: 'starting', ollama: 'active' };
    this.logger.log('Iniciando servicios de IA (solo producción)');
    setTimeout(() => {
      results.whisper = 'degraded';
      results.ocr = 'degraded';
    }, 2000);
    return results;
  }

  private async getWhisperUrl(): Promise<string> {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key: 'AI_WHISPER_ENDPOINT' } });
    if (setting && setting.value === '') return '';
    const endpoint = setting?.value || process.env.WHISPER_API_URL || 'http://localhost:8000/v1/audio/transcriptions';
    return endpoint.replace('/v1/audio/transcriptions', '');
  }

  private async getOcrModel(): Promise<string> {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key: 'AI_OCR_MODEL' } });
    if (setting && setting.value === '') return '';
    return setting?.value || process.env.OLLAMA_VISION_MODEL || 'llama3.2-vision';
  }
}
