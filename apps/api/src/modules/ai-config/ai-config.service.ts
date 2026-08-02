import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AiConfigDto {
  textModel: string;
  embeddingModel: string;
  whisperEndpoint: string;
  whisperModel: string;
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
    };
  }

  async updateConfig(dto: AiConfigDto, userId: string) {
    const updates = [
      { key: 'AI_MODEL_TEXT', value: dto.textModel },
      { key: 'AI_MODEL_EMBEDDING', value: dto.embeddingModel },
      { key: 'AI_WHISPER_ENDPOINT', value: dto.whisperEndpoint },
      { key: 'AI_WHISPER_MODEL', value: dto.whisperModel },
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
}
