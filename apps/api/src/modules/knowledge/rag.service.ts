import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingsService } from './embeddings.service';

@Injectable()
export class RAGService {
  private readonly logger = new Logger(RAGService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingsService,
  ) {}

  /**
   * Buscar documentos similares en la base de conocimiento usando RAG
   */
  async searchSimilarChunks(query: string, limit: number = 5): Promise<
    Array<{
      id: string;
      content: string;
      documentId: string;
      documentTitle: string;
      metadata: any;
    }>
  > {
    try {
      // 1. Generar embedding de la consulta
      const queryEmbedding = await this.embeddings.getEmbedding(query);
      const embeddingStr = `[${queryEmbedding.join(',')}]`;

      // 2. Buscar chunks similares usando pgvector (cosine similarity)
      const results = await this.prisma.$queryRaw<
        Array<{
          id: string;
          content: string;
          documentId: string;
          document_title: string;
          metadata: any;
        }>
      >`
        SELECT 
          kc.id,
          kc.content,
          kc."documentId",
          ld.title as document_title,
          kc.metadata,
          (kc.embedding <=> $1::vector) as similarity
        FROM "KnowledgeChunk" kc
        JOIN "LegalDocument" ld ON kc."documentId" = ld.id
        WHERE ld."isActive" = true
        ORDER BY similarity ASC
        LIMIT $2
      `;

      return results.map((r) => ({
        id: r.id,
        content: r.content,
        documentId: r.documentId,
        documentTitle: r.document_title,
        metadata: r.metadata,
      }));
    } catch (error) {
      this.logger.error(`Error en búsqueda RAG: ${error.message}`);
      throw new BadRequestException('Error al buscar en la base de conocimiento');
    }
  }

  /**
   * Construir contexto para Ollama basado en chunks encontrados
   */
  buildRAGContext(chunks: Array<{ content: string; documentTitle: string }>): string {
    if (chunks.length === 0) {
      return 'No se encontraron documentos relevantes en la base de conocimiento.';
    }

    return chunks
      .map(
        (chunk, idx) => `
[Fuente ${idx + 1}: ${chunk.documentTitle}]
${chunk.content}
---
      `,
      )
      .join('\n');
  }

  /**
   * Llamar a Ollama con contexto RAG
   */
  private async getOllamaConfig() {
    const endpointSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'OLLAMA_ENDPOINT' },
    });
    const modelSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'OLLAMA_MODEL' },
    });

    const endpoint = endpointSetting?.value || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    const model = modelSetting?.value || process.env.OLLAMA_MODEL || 'mistral';

    return { endpoint, model };
  }

  async queryOllamaWithRAG(
    userQuery: string,
    systemPrompt: string,
    ragContext: string,
  ): Promise<string> {
    const { endpoint, model } = await this.getOllamaConfig();

    const prompt = `
${ragContext}

---

Pregunta del usuario: ${userQuery}

Responde basándote SOLO en la información anterior de la base de conocimiento legal. Si no encuentras información relevante, di explícitamente "No tengo información sobre esto en la base de conocimiento".
    `;

    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          system: systemPrompt,
          stream: false,
          options: {
            temperature: 0.3,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en API Ollama: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      this.logger.error(`Error consultando Ollama: ${error.message}`);
      throw new BadRequestException(
        'El servicio de IA local (Ollama) no está disponible. Contacte al administrador.',
      );
    }
  }
}
