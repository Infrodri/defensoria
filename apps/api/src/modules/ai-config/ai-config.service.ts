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
    const keys = ['AI_MODEL_TEXT', 'AI_MODEL_EMBEDDING', 'AI_WHISPER_ENDPOINT', 'AI_WHISPER_MODEL'];
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
      ocrModel: map.get('AI_OCR_MODEL') || 'qwen2.5-vl:7b',
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
      const response = await fetch('http://localhost:11434/api/tags');
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
      const ollamaRes = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(3000) });
      results.ollama = ollamaRes.ok ? 'ok' : 'degraded';
    } catch {
      results.ollama = 'degraded';
    }

    // Check Whisper
    try {
      const whisperRes = await fetch('http://localhost:8000/health', { signal: AbortSignal.timeout(3000) });
      results.whisper = whisperRes.ok ? 'ok' : 'degraded';
    } catch {
      results.whisper = 'degraded';
    }

    // Check OCR
    try {
      const ocrRes = await fetch('http://localhost:8001/health', { signal: AbortSignal.timeout(3000) });
      results.ocr = ocrRes.ok ? 'ok' : 'degraded';
    } catch {
      results.ocr = 'degraded';
    }

    return results;
  }

  async startServices() {
    const results: { whisper: string; ocr: string; ollama: string } = { whisper: 'starting', ocr: 'starting', ollama: 'active' };
    
    // In production, you might want to use docker compose or individual docker run commands
    // For now, we'll just return that we attempted to start services
    // The actual implementation would depend on your production environment
    
    this.logger.log('Iniciando servicios de IA (solo producción)');
    
    // In a real implementation, you would:
    // 1. Check if services are already running
    // 2. Use docker compose or docker run commands
    // 3. Wait for services to be ready
    // 4. Return status
    
    // For now, we'll simulate the behavior with a timeout
    setTimeout(() => {
      results.whisper = 'degraded'; // Whisper is not running by default
      results.ocr = 'degraded';     // OCR is not running by default
    }, 2000);
    
    return results;
  }

  private async getWhisperUrl(): Promise<string> {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key: 'AI_WHISPER_ENDPOINT' } });
    const endpoint = setting?.value || process.env.WHISPER_API_URL || 'http://localhost:8000/v1/audio/transcriptions';
    return endpoint.replace('/v1/audio/transcriptions', '');
  }

  private async getOcrUrl(): Promise<string> {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key: 'AI_OCR_ENDPOINT' } });
    const endpoint = setting?.value || process.env.OCR_API_URL || 'http://localhost:8001/v1/vision';
    return endpoint.replace('/v1/vision', '');
  }
}
