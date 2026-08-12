import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  // Fallbacks — se usan cuando no hay config en systemSetting
  private readonly DEFAULT_OLLAMA_URL = 'http://localhost:11434';
  private readonly DEFAULT_MODEL = 'nomic-embed-text';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lee endpoint y modelo de embeddings desde systemSetting.
   * Cae a los defaults si no hay config guardada.
   */
  private async getConfig(): Promise<{ ollamaUrl: string; modelName: string }> {
    try {
      const settings = await this.prisma.systemSetting.findMany({
        where: { key: { in: ['OLLAMA_ENDPOINT', 'AI_MODEL_EMBEDDING'] } },
      });
      const map = new Map(settings.map(s => [s.key, s.value]));

      const baseUrl = map.get('OLLAMA_ENDPOINT') || process.env.OLLAMA_ENDPOINT || this.DEFAULT_OLLAMA_URL;
      const model = map.get('AI_MODEL_EMBEDDING') || process.env.OLLAMA_EMBEDDING_MODEL || this.DEFAULT_MODEL;

      // Normalizar: quitar slash final y agregar /api/embeddings
      const ollamaUrl = `${baseUrl.replace(/\/$/, '')}/api/embeddings`;

      return { ollamaUrl, modelName: model };
    } catch {
      // Si Prisma falla (ej. durante el arranque), usar defaults
      return {
        ollamaUrl: `${this.DEFAULT_OLLAMA_URL}/api/embeddings`,
        modelName: this.DEFAULT_MODEL,
      };
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    const { ollamaUrl, modelName } = await this.getConfig();

    try {
      const response = await fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Sin detalles en el body');
        throw new Error(`Error de Ollama (${response.status} ${response.statusText}): ${errorText}`);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      this.logger.error(`Falló la generación de embedding con modelo ${modelName}: ${error.message}`);
      throw error;
    }
  }
}
