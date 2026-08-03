import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingsService } from '../knowledge/embeddings.service';
import axios from 'axios';
import FormData from 'form-data';

// ──────────────────────────────────────────────────────────────────────────────
// EvidenceRagService
// Procesa cada evidencia subida al expediente y la indexa en el RAG del caso.
//
// PIPELINE por tipo de archivo:
//  audio/video  → Whisper transcribe → embedding → case_chunks
//  image        → Ollama vision (llava) describe → embedding → case_chunks
//  pdf/docx     → pdf-parse extrae texto → embedding → case_chunks
//  report       → contenido del informe → embedding → case_chunks
//
// Todos los métodos son fire-and-forget: la carga de evidencia responde
// inmediatamente y el procesamiento RAG ocurre en segundo plano.
// ──────────────────────────────────────────────────────────────────────────────

@Injectable()
export class EvidenceRagService {
  private readonly logger = new Logger(EvidenceRagService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingsService,
  ) {}

  // ── Punto de entrada principal ─────────────────────────────────────────────

  /**
   * Dispara el pipeline RAG de forma asíncrona.
   * Llamar con .catch() para no bloquear la respuesta HTTP.
   */
  async processEvidenceAsync(
    caseId: string,
    evidenceId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    description?: string,
  ): Promise<void> {
    this.logger.log(`[RAG] Iniciando pipeline para evidencia ${evidenceId} (${file.mimetype})`);

    try {
      const mime = file.mimetype.toLowerCase();

      if (mime.startsWith('audio/') || mime.startsWith('video/')) {
        await this.processAudioVideo(caseId, evidenceId, file, description);
      } else if (mime.startsWith('image/')) {
        await this.processImage(caseId, evidenceId, file, description);
      } else if (mime === 'application/pdf') {
        await this.processPdf(caseId, evidenceId, file, description);
      } else {
        // Para DOCX y otros formatos de texto: indexar la descripción
        await this.indexChunk(caseId, evidenceId, 'document_text',
          description || `Documento adjunto: ${file.originalname}`,
          { fileName: file.originalname, mimeType: file.mimetype },
        );
      }
    } catch (err: any) {
      this.logger.warn(`[RAG] Pipeline falló para evidencia ${evidenceId}: ${err.message}`);
      // No relanzar — es un proceso en segundo plano, no debe afectar la respuesta
    }
  }

  // ── Audio y Video → Transcripción Whisper ─────────────────────────────────

  private async processAudioVideo(
    caseId: string,
    evidenceId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    description?: string,
  ) {
    this.logger.log(`[RAG] Transcribiendo audio/video: ${file.originalname}`);

    const whisperUrl = process.env.WHISPER_API_URL || 'http://localhost:8000/v1/audio/transcriptions';
    let transcribedText = '';

    try {
      const formData = new FormData();
      formData.append('file', file.buffer, { filename: file.originalname, contentType: file.mimetype });
      formData.append('model', 'whisper-1');
      formData.append('language', 'es');

      const response = await axios.post(whisperUrl, formData, {
        headers: formData.getHeaders(),
        timeout: 60_000,
      });
      transcribedText = response.data.text || response.data.result?.text || '';
    } catch (whisperErr: any) {
      this.logger.warn(`[RAG] Whisper no disponible: ${whisperErr.message}`);
      transcribedText = description
        ? `Grabación de audio: ${description}`
        : `Archivo de audio adjunto al expediente: ${file.originalname}`;
    }

    if (transcribedText.trim().length > 10) {
      // Solo indexamos en case_chunks — no duplicamos en la tabla Transcription
      // ya que esa tabla tiene su propio flujo con evidenceId y createdBy requeridos
      await this.indexChunk(caseId, evidenceId, 'audio_transcript', transcribedText, {
        fileName: file.originalname,
        description,
        source: 'whisper_transcription',
      });
    }
  }

  // ── Imagen → Descripción por IA Vision ────────────────────────────────────

  private async processImage(
    caseId: string,
    evidenceId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    description?: string,
  ) {
    this.logger.log(`[RAG] Analizando imagen: ${file.originalname}`);

    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    let imageDescription = '';

    try {
      const base64Image = file.buffer.toString('base64');
      const response = await axios.post(`${ollamaUrl}/api/generate`, {
        model: 'llava',
        prompt: `Describí en detalle esta imagen en español. 
Contexto: es una evidencia de un caso de la Defensoría de la Niñez y Adolescencia de Bolivia.
Identificá: personas visibles (sin nombrar), objetos, ambiente, posibles indicadores de violencia o vulneración de derechos, condiciones del lugar.
Sé objetivo y profesional, como un perito forense.`,
        images: [base64Image],
        stream: false,
      }, { timeout: 30_000 });

      imageDescription = response.data.response || '';
    } catch (visionErr: any) {
      this.logger.warn(`[RAG] Ollama vision no disponible: ${visionErr.message}`);
      imageDescription = description
        ? `Imagen adjunta: ${description}`
        : `Imagen fotográfica adjunta al expediente: ${file.originalname}`;
    }

    if (imageDescription.trim().length > 10) {
      await this.indexChunk(caseId, evidenceId, 'image_description', imageDescription, {
        fileName: file.originalname,
        description,
        source: 'vision_analysis',
      });
    }
  }

  // ── PDF → Extracción de texto ──────────────────────────────────────────────

  private async processPdf(
    caseId: string,
    evidenceId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    description?: string,
  ) {
    this.logger.log(`[RAG] Extrayendo texto de PDF: ${file.originalname}`);

    let pdfText = '';

    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(file.buffer);
      pdfText = data.text?.replace(/\x00/g, '').trim() || '';
    } catch (pdfErr: any) {
      this.logger.warn(`[RAG] pdf-parse falló: ${pdfErr.message}`);
      pdfText = description
        ? `Documento PDF: ${description}`
        : `Documento PDF adjunto al expediente: ${file.originalname}`;
    }

    if (pdfText.length > 20) {
      // Dividir en chunks de ≤2000 chars para no superar el límite de embedding
      const chunks = this.splitIntoChunks(pdfText, 2000, 200);

      for (let i = 0; i < chunks.length; i++) {
        await this.indexChunk(caseId, evidenceId, 'pdf_text', chunks[i], {
          fileName: file.originalname,
          description,
          chunkIndex: i,
          totalChunks: chunks.length,
          source: 'pdf_extract',
        });
      }
    }
  }

  // ── Método central de indexación ──────────────────────────────────────────

  /**
   * Genera el embedding y guarda el chunk en case_chunks.
   * Si Ollama no está disponible, guarda el texto sin embedding para que
   * al menos quede disponible para búsqueda por texto plano.
   */
  private async indexChunk(
    caseId: string,
    evidenceId: string | null,
    sourceType: string,
    content: string,
    metadata: Record<string, any> = {},
  ) {
    if (!content || content.trim().length < 10) return;

    let vectorStr: string | null = null;

    try {
      const vector = await this.embeddings.getEmbedding(content.slice(0, 4000));
      vectorStr = `[${vector.join(',')}]`;
    } catch (embedErr: any) {
      this.logger.warn(`[RAG] Embedding no disponible: ${embedErr.message}. Guardando sin vector.`);
    }

    try {
      if (vectorStr) {
        await this.prisma.$executeRaw`
          INSERT INTO case_chunks (id, "caseId", "evidenceId", "sourceType", content, metadata, embedding, "createdAt")
          VALUES (
            gen_random_uuid(),
            ${caseId}::uuid,
            ${evidenceId ? `${evidenceId}::uuid` : null},
            ${sourceType},
            ${content},
            ${JSON.stringify(metadata)}::jsonb,
            ${vectorStr}::vector,
            NOW()
          )
        `;
      } else {
        await this.prisma.$executeRaw`
          INSERT INTO case_chunks (id, "caseId", "evidenceId", "sourceType", content, metadata, "createdAt")
          VALUES (
            gen_random_uuid(),
            ${caseId}::uuid,
            ${evidenceId},
            ${sourceType},
            ${content},
            ${JSON.stringify(metadata)}::jsonb,
            NOW()
          )
        `;
      }

      this.logger.log(`[RAG] Chunk indexado para caso ${caseId} (tipo: ${sourceType}, ${content.length} chars)`);
    } catch (dbErr: any) {
      this.logger.error(`[RAG] Error guardando chunk en BD: ${dbErr.message}`);
    }
  }

  // ── Búsqueda semántica en RAG del caso ────────────────────────────────────

  /**
   * Buscar chunks relevantes del expediente para contexto de análisis.
   * Usado por las herramientas y el AI assistant cuando se le pasa un caseId.
   */
  async searchCaseContext(caseId: string, query: string, limit = 8): Promise<string> {
    try {
      const queryEmbedding = await this.embeddings.getEmbedding(query);
      const embeddingStr = `[${queryEmbedding.join(',')}]`;

      const results = await this.prisma.$queryRaw<Array<{ content: string; sourceType: string; metadata: any }>>`
        SELECT content, "sourceType", metadata
        FROM case_chunks
        WHERE "caseId" = ${caseId}::uuid
          AND embedding IS NOT NULL
        ORDER BY embedding <=> ${embeddingStr}::vector
        LIMIT ${limit}
      `;

      if (results.length === 0) return '';

      return results
        .map((r) => {
          const label = {
            audio_transcript:  '🎙️ Transcripción de audio',
            image_description: '🖼️ Descripción de imagen',
            pdf_text:          '📄 Texto de documento PDF',
            document_text:     '📎 Documento adjunto',
            report:            '📋 Informe profesional',
            action_log:        '📝 Actuación registrada',
          }[r.sourceType] || '📌 Material del caso';

          return `${label}:\n${r.content}`;
        })
        .join('\n\n---\n\n');
    } catch (err: any) {
      this.logger.warn(`[RAG] Búsqueda fallida: ${err.message}`);
      return '';
    }
  }

  /**
   * Indexar el contenido de un informe profesional al emitirlo.
   */
  async indexReport(caseId: string, reportId: string, content: string, reportType: string) {
    await this.indexChunk(caseId, null, 'report', content, {
      reportId,
      reportType,
      source: 'professional_report',
    });
  }

  /**
   * Indexar una actuación de la bitácora.
   */
  async indexActionLog(caseId: string, logId: string, title: string, content: string) {
    await this.indexChunk(caseId, null, 'action_log', `${title}\n${content}`, {
      logId,
      source: 'action_log',
    });
  }

  // ── Utilidades ─────────────────────────────────────────────────────────────

  private splitIntoChunks(text: string, maxSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + maxSize, text.length);
      chunks.push(text.slice(start, end));
      start = end - overlap;
      if (start >= text.length) break;
    }

    return chunks.filter((c) => c.trim().length > 20);
  }
}
