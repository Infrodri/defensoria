import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { EvidenceRagService } from '../evidences/evidence-rag.service';
import axios from 'axios';
import * as FormData from 'form-data';
import { Readable } from 'stream';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
    private evidenceRag: EvidenceRagService,
  ) {}

  /**
   * Buscar dentro de una transcripción
   */
  async searchInTranscription(
    caseId: string,
    query: string,
  ): Promise<
    Array<{
      transcriptionId: string;
      text: string;
      matchedText: string;
      position: number;
    }>
  > {
    try {
      // Buscar usando PostgreSQL full-text search
      const results = await this.prisma.$queryRaw<
        Array<{
          id: string;
          text: string;
          matched_text: string;
          position: number;
        }>
      >`
        SELECT 
          t.id,
          t.text,
          SUBSTRING(t.text FROM POSITION($2 IN t.text) FOR LENGTH($2) + 50) as matched_text,
          POSITION($2 IN LOWER(t.text)) as position
        FROM transcriptions t
        WHERE t."caseId" = $1::uuid
          AND LOWER(t.text) LIKE LOWER('%' || $2 || '%')
        ORDER BY position ASC
      `;

      return results.map((r) => ({
        transcriptionId: r.id,
        text: r.text.substring(0, 500),
        matchedText: r.matched_text,
        position: r.position,
      }));
    } catch (error) {
      this.logger.error(`Error buscando en transcripción: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtener transcripciones completadas de un caso
   */
  async getTranscriptionsForCase(
    caseId: string,
  ): Promise<
    Array<{
      id: string;
      text: string;
      language: string;
      status: string;
    }>
  > {
    return this.prisma.transcription.findMany({
      where: {
        caseId,
        status: 'COMPLETADA',
      },
      select: {
        id: true,
        text: true,
        language: true,
        status: true,
      },
    });
  }

  /**
   * Obtener la primera transcripción completada del caso
   */
  async getLatestTranscriptionForCase(caseId: string) {
    return this.prisma.transcription.findFirst({
      where: {
        caseId,
        status: 'COMPLETADA',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Transcribir una evidencia ya almacenada en MinIO, identificada por su ID.
   * El frontend solo manda { caseId, evidenceId } — el archivo se descarga internamente.
   */
  async transcribeByEvidenceId(caseId: string, evidenceId: string, userId?: string) {
    const evidence = await this.prisma.evidence.findUnique({ where: { id: evidenceId } });
    if (!evidence) {
      throw new BadRequestException('Evidencia no encontrada');
    }
    if (evidence.caseId !== caseId) {
      throw new BadRequestException('La evidencia no pertenece al expediente indicado');
    }

    const supportedMimeTypes = [
      'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/x-m4a',
      'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac',
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
      'image/jpeg', 'image/png', 'image/webp', 'image/jpg',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!supportedMimeTypes.includes(evidence.mimeType)) {
      throw new BadRequestException(`Tipo de archivo no soportado para extracción: ${evidence.mimeType}`);
    }

    // Descargar el archivo desde MinIO como buffer
    const stream = await this.minioService.getFileStream(evidence.storagePath);
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      (stream as Readable).on('data', (chunk: Buffer) => chunks.push(chunk));
      (stream as Readable).on('end', () => resolve(Buffer.concat(chunks)));
      (stream as Readable).on('error', reject);
    });

    const multerLike: Express.Multer.File = {
      buffer,
      originalname: evidence.fileName,
      mimetype: evidence.mimeType,
      size: buffer.length,
      fieldname: 'file',
      encoding: '7bit',
      stream: Readable.from(buffer),
      destination: '',
      filename: evidence.fileName,
      path: '',
    };

    return this.transcribeAudioFile(caseId, evidenceId, multerLike, userId);
  }

  /**
   * Transcribir o extraer texto de un archivo (audio, imagen, PDF, docx)
   */
  async transcribeAudioFile(
    caseId: string,
    evidenceId: string | undefined,
    file: Express.Multer.File,
    userId?: string,
  ) {
    try {
      const isImage = file.mimetype.startsWith('image/');
      const isPdf = file.mimetype === 'application/pdf';
      const isDocx = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      // 1. Si no hay evidencia asignada (subida directa), crear o buscar registro
      let transcription = await this.prisma.transcription.findFirst({
        where: { caseId, evidenceId: evidenceId || null },
      });

      if (!transcription) {
        transcription = await this.prisma.transcription.create({
          data: {
            caseId,
            evidenceId: evidenceId || null,
            text: '',
            status: 'PENDIENTE',
            language: 'es',
            confidence: 0,
            createdBy: userId,
          },
        });
      } else {
        await this.prisma.transcription.update({
          where: { id: transcription.id },
          data: { status: 'PROCESSING' },
        });
      }

      let transcribedText = '';

      if (isImage) {
        // Llamar a Ollama Vision API (auto-detectando modelo visión disponible)
        const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        try {
          let visionModel = process.env.OLLAMA_VISION_MODEL || 'llava';
          try {
            const tagsRes = await axios.get(`${ollamaUrl}/api/tags`, { timeout: 3000 });
            const models: any[] = tagsRes.data?.models || [];
            const found = models.find((m) =>
              m.capabilities?.includes('vision') ||
              ['llava', 'gemma4:12b', 'qwen3.5:35b', 'llama3.2-vision', 'bakllava', 'qwen2.5-vl'].some((v) => m.name?.toLowerCase().includes(v))
            );
            if (found) visionModel = found.name;
          } catch (tagsErr) {}

          this.logger.log(`Usando modelo de visión '${visionModel}' para análisis de imagen`);

          const base64Image = file.buffer.toString('base64');
          const response = await axios.post(
            `${ollamaUrl}/api/generate`,
            {
              model: visionModel,
              prompt: `Analiza esta imagen en detalle en español.
Contexto: es evidencia de un caso de la Defensoría de la Niñez y Adolescencia en Bolivia.
Si es una captura de pantalla de chats (WhatsApp, Messenger, Facebook, etc.), mensajes, documentos, cartas o letreros: EXTRAE TODO EL TEXTO VISIBLE LETRA POR LETRA.
Si contiene una escena o personas: describe objetivamente qué se observa sin nombres personales.

Responde estrictamente en este formato:
[DESCRIPCIÓN VISUAL DE LA ESCENA]: ...
[TEXTO EXTRAÍDO (OCR / CHATS / DOCUMENTOS)]: ...`,
              images: [base64Image],
              stream: false,
            },
            { timeout: 90000 },
          );
          transcribedText = response.data.response || '';
        } catch (visionError: any) {
          this.logger.warn(`Ollama Vision API no disponible: ${visionError.message}`);
          transcribedText = `[OCR no disponible - Servicio de visión sin respuesta] Archivo: ${file.originalname}`;
        }
      } else if (isPdf) {
        try {
          const pdfParse = require('pdf-parse');
          const data = await pdfParse(file.buffer);
          transcribedText = data.text?.replace(/\x00/g, '').trim() || '';
        } catch (e: any) {
          this.logger.warn(`PDF parse error: ${e.message}`);
          transcribedText = `[Extracción no disponible - Error al leer PDF] Archivo: ${file.originalname}`;
        }
      } else if (isDocx) {
        try {
          const mammoth = require('mammoth');
          const res = await mammoth.extractRawText({ buffer: file.buffer });
          transcribedText = res.value?.trim() || '';
        } catch (e: any) {
          this.logger.warn(`DOCX parse error: ${e.message}`);
          transcribedText = `[Extracción no disponible - Error al leer DOCX] Archivo: ${file.originalname}`;
        }
      } else {
        // Llamar a Whisper API
        const whisperUrl = process.env.WHISPER_API_URL || 'http://localhost:8000/v1/audio/transcriptions';
        
        const formData = new FormData();
        formData.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
        formData.append('model', 'whisper-1');
        formData.append('language', 'es');

        try {
          const response = await axios.post(whisperUrl, formData, {
            headers: formData.getHeaders(),
            timeout: 30000,
          });

          transcribedText = response.data.text || response.data.result?.text || '';
        } catch (whisperError: any) {
          this.logger.warn(`Whisper API no disponible: ${whisperError.message}, usando mock`);
          transcribedText = `[Transcripción no disponible - Whisper API sin respuesta] Archivo: ${file.originalname}`;
        }
      }

      // Actualizar transcripción con el texto y marcar como completada
      const updated = await this.prisma.transcription.update({
        where: { id: transcription.id },
        data: {
          text: transcribedText,
          status: 'COMPLETADA',
          confidence: 0.85,
        },
      });

      // Indexar en case_chunks para que el RAG del expediente pueda leerla
      if (transcribedText.trim().length > 10 && !transcribedText.startsWith('[Transcripción no disponible') && !transcribedText.startsWith('[OCR no disponible')) {
        this.evidenceRag
          .indexChunkPublic(caseId, evidenceId || null, isImage ? 'image_description' : 'audio_transcript', transcribedText, {
            transcriptionId: updated.id,
            fileName: file.originalname,
            source: isImage ? 'vision_analysis' : 'manual_transcription',
          })
          .catch((err) =>
            this.logger.warn(`[RAG] No se pudo indexar extracción ${updated.id}: ${err.message}`),
          );
      }

      return {
        id: updated.id,
        text: updated.text,
        language: updated.language,
        status: updated.status,
        confidence: updated.confidence,
      };
    } catch (error: any) {
      this.logger.error(`Error procesando archivo: ${error.message}`);
      throw new BadRequestException(error.message || 'Error al procesar el archivo');
    }
  }

  /**
   * Buscar en transcripciones de un caso
   */
  async searchInCaseTranscriptions(caseId: string, query: string) {
    const results = await this.searchInTranscription(caseId, query);
    return {
      query,
      results,
      count: results.length,
    };
  }
}
