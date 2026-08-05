import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AiConfigDto {
  textModel: string;
  embeddingModel: string;
  whisperEndpoint: string;
  whisperModel: string;
  visionModel: string;
}

@Injectable()
export class AiConfigService {
  private readonly logger = new Logger(AiConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getConfig(): Promise<AiConfigDto> {
    const keys = ['AI_MODEL_TEXT', 'AI_MODEL_EMBEDDING', 'AI_WHISPER_ENDPOINT', 'AI_WHISPER_MODEL', 'AI_MODEL_VISION'];
    const settings = await this.prisma.systemSetting.findMany({
      where: { key: { in: keys } },
    });

    const map = new Map(settings.map(s => [s.key, s.value]));

    return {
      textModel: map.get('AI_MODEL_TEXT') || 'qwen2.5:7b',
      embeddingModel: map.get('AI_MODEL_EMBEDDING') || 'nomic-embed-text',
      whisperEndpoint: map.get('AI_WHISPER_ENDPOINT') || 'http://localhost:8000/v1/audio/transcriptions',
      whisperModel: map.get('AI_WHISPER_MODEL') || 'whisper-1',
      visionModel: map.get('AI_MODEL_VISION') || 'gemma4-tasks:latest',
    };
  }

  async updateConfig(dto: AiConfigDto, userId: string) {
    const updates = [
      { key: 'AI_MODEL_TEXT', value: dto.textModel },
      { key: 'AI_MODEL_EMBEDDING', value: dto.embeddingModel },
      { key: 'AI_WHISPER_ENDPOINT', value: dto.whisperEndpoint },
      { key: 'AI_WHISPER_MODEL', value: dto.whisperModel },
      { key: 'AI_MODEL_VISION', value: dto.visionModel },
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

  /**
   * Lista los modelos locales de Ollama, exponiendo por separado los que tienen
   * capacidad de visión (para el análisis de imágenes). El fallback heurístico
   * por nombre cubre Ollama antiguos sin el campo capabilities.
   */
  async getLocalModels() {
    const fallback = { models: [] as string[], visionModels: [] as string[], capabilities: {} as Record<string, string[]> };
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (!response.ok) return fallback;
      const data = await response.json();

      const names: string[] = [];
      const capabilities: Record<string, string[]> = {};

      for (const m of data.models || []) {
        const name: string = m.name;
        names.push(name);
        capabilities[name] = Array.isArray(m.capabilities) ? m.capabilities.map(String) : [];
      }

      let visionModels = names.filter((n) => (capabilities[n] || []).includes('vision'));

      // Fallback heurístico para Ollama que no reportan capabilities
      if (visionModels.length === 0) {
        visionModels = names.filter((n) => /^(llava|bakllava|minicpm|moondream|qwen2[.-]?vl)/i.test(n));
      }

      return { models: names, visionModels: visionModels.length ? visionModels : names, capabilities };
    } catch (e) {
      this.logger.warn('No se pudo conectar con Ollama local');
      return fallback;
    }
  }
}
