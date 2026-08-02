import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly ollamaUrl = 'http://localhost:11434/api/embeddings';
  private readonly modelName = 'nomic-embed-text'; // Modelo local

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
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
      this.logger.error(`Falló la generación de embedding: ${error.message}`);
      throw error;
    }
  }
}
