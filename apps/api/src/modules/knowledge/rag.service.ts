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
      // 1. Extraer coincidencia de artículo y ley de la consulta
      const artMatch = query.match(/(?:ARTÍCULOS?|ARTICULOS?|ART\.?)\s*(\d+)/i);
      const targetArticleNum = artMatch ? artMatch[1] : null;

      const leyNumMatch = query.match(/LEY\s*N?[º°]?\s*(\d+)/i);
      const targetLeyNum = leyNumMatch ? leyNumMatch[1] : null;

      let exactArticleChunks: Array<{
        id: string;
        content: string;
        legalDocumentId: string;
        document_title: string;
        metadata: any;
      }> = [];

      if (targetArticleNum) {
        // A) Buscar coincidencia exacta acotada al número de Ley si existe
        if (targetLeyNum) {
          exactArticleChunks = await this.prisma.$queryRaw<any[]>`
            SELECT 
              kc.id,
              kc.content,
              kc."legalDocumentId",
              ld.title as document_title,
              kc.metadata
            FROM "legal_chunks" kc
            JOIN "legal_documents" ld ON kc."legalDocumentId" = ld.id
            WHERE ld."isActive" = true
              AND (ld.title LIKE ${`%${targetLeyNum}%`})
              AND (
                kc.content LIKE ${`ARTÍCULO ${targetArticleNum}.%`}
                OR kc.content LIKE ${`ARTICULO ${targetArticleNum}.%`}
                OR kc.content LIKE ${`%ARTÍCULO ${targetArticleNum}.%`}
                OR kc.content LIKE ${`%ARTICULO ${targetArticleNum}.%`}
              )
            LIMIT 3
          `;
        }

        // B) Si no se encontró especificando Ley, buscar coincidencia en cualquier norma
        if (exactArticleChunks.length === 0) {
          exactArticleChunks = await this.prisma.$queryRaw<any[]>`
            SELECT 
              kc.id,
              kc.content,
              kc."legalDocumentId",
              ld.title as document_title,
              kc.metadata
            FROM "legal_chunks" kc
            JOIN "legal_documents" ld ON kc."legalDocumentId" = ld.id
            WHERE ld."isActive" = true
              AND (
                kc.content LIKE ${`ARTÍCULO ${targetArticleNum}.%`}
                OR kc.content LIKE ${`ARTICULO ${targetArticleNum}.%`}
                OR kc.content LIKE ${`%ARTÍCULO ${targetArticleNum}.%`}
                OR kc.content LIKE ${`%ARTICULO ${targetArticleNum}.%`}
              )
            LIMIT 3
          `;
        }
      }

      // 1.5. Extraer frases significativas para coincidencia de texto exacta (ej: citaciones o citas de leyes)
      let phraseChunks: Array<{
        id: string;
        content: string;
        legalDocumentId: string;
        document_title: string;
        metadata: any;
      }> = [];

      const stopWords = new Set([
        'a', 'que', 'el', 'la', 'los', 'las', 'de', 'del', 'en', 'un', 'una', 'unos', 'unas',
        'se', 'su', 'sus', 'por', 'para', 'con', 'sin', 'este', 'esta', 'estos', 'estas',
        'texto', 'frase', 'refiere', 'articulo', 'artículo', 'ley', '548', 'dice', 'refiera', 'indica'
      ]);

      const rawWords = query.split(/\s+/).map(w => w.replace(/[^\wáéíóúñÁÉÍÓÚÑ]/gi, '')).filter(Boolean);
      const candidatePhrases: string[] = [];
      for (let i = 0; i < rawWords.length - 1; i++) {
        const w1 = rawWords[i].toLowerCase();
        const w2 = rawWords[i + 1].toLowerCase();
        if (!stopWords.has(w1) && !stopWords.has(w2) && w1.length > 2 && w2.length > 2) {
          candidatePhrases.push(`${rawWords[i]} ${rawWords[i + 1]}`);
        }
      }

      if (candidatePhrases.length > 0) {
        const targetPhrase = candidatePhrases[candidatePhrases.length - 1]; // Frase más relevante del final
        phraseChunks = await this.prisma.$queryRaw<any[]>`
          SELECT 
            kc.id,
            kc.content,
            kc."legalDocumentId",
            ld.title as document_title,
            kc.metadata
          FROM "legal_chunks" kc
          JOIN "legal_documents" ld ON kc."legalDocumentId" = ld.id
          WHERE ld."isActive" = true
            AND (kc.content ILIKE ${`%${targetPhrase}%`})
          LIMIT 3
        `;
      }

      // 2. Generar embedding de la consulta y búsqueda vectorial
      const queryEmbedding = await this.embeddings.getEmbedding(query);
      const embeddingStr = `[${queryEmbedding.join(',')}]`;

      const vectorResults = await this.prisma.$queryRaw<
        Array<{
          id: string;
          content: string;
          legalDocumentId: string;
          document_title: string;
          metadata: any;
        }>
      >`
        SELECT 
          kc.id,
          kc.content,
          kc."legalDocumentId",
          ld.title as document_title,
          kc.metadata,
          (kc.embedding <=> ${embeddingStr}::vector) as similarity
        FROM "legal_chunks" kc
        JOIN "legal_documents" ld ON kc."legalDocumentId" = ld.id
        WHERE ld."isActive" = true
        ORDER BY similarity ASC
        LIMIT ${limit}
      `;

      // 3. Fusión Híbrida Tridireccional:
      // Prioridad 1: Coincidencia por frase literal / citación
      // Prioridad 2: Coincidencia por número de artículo
      // Prioridad 3: Búsqueda vectorial semántica
      const combinedMap = new Map<string, any>();
      for (const r of phraseChunks) {
        combinedMap.set(r.id, r);
      }
      for (const r of exactArticleChunks) {
        if (!combinedMap.has(r.id)) {
          combinedMap.set(r.id, r);
        }
      }
      for (const r of vectorResults) {
        if (!combinedMap.has(r.id)) {
          combinedMap.set(r.id, r);
        }
      }

      const finalChunks = Array.from(combinedMap.values()).slice(0, limit);

      return finalChunks.map((r) => ({
        id: r.id,
        content: r.content,
        documentId: r.legalDocumentId,
        documentTitle: r.document_title,
        metadata: r.metadata,
      }));
    } catch (error: any) {
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

  /**
   * Consultar a Ollama SIN contexto RAG (LLM directo).
   * Usado por herramientas que no necesitan anclarse a la base de conocimiento,
   * como la traducción de notas clínicas a lenguaje forense.
   */
  async queryOllama(systemPrompt: string, userQuery: string): Promise<string> {
    const { endpoint, model } = await this.getOllamaConfig();

    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: userQuery,
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
