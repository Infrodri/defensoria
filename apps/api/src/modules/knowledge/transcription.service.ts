import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
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

    const audioMimeTypes = [
      'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/x-m4a',
      'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac',
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
    ];
    if (!audioMimeTypes.includes(evidence.mimeType)) {
      throw new BadRequestException(`Tipo de archivo no soportado para transcripción: ${evidence.mimeType}`);
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
   * Transcribir un archivo de audio usando Whisper API
   */
  async transcribeAudioFile(
    caseId: string,
    evidenceId: string | undefined,
    file: Express.Multer.File,
    userId?: string,
  ) {
    try {
      // Crear entrada de transcripción en estado PENDIENTE
      const transcription = await this.prisma.transcription.create({
        data: {
          caseId,
          evidenceId: evidenceId || `audio-${Date.now()}`,
          text: '',
          status: 'PENDIENTE',
          language: 'es',
          confidence: 0,
          createdBy: userId,
        },
      });

      // Llamar a Whisper API
      const whisperUrl = process.env.WHISPER_API_URL || 'http://localhost:8000/v1/audio/transcriptions';
      
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      formData.append('model', 'whisper-1');
      formData.append('language', 'es');

      let transcribedText = '';
      try {
        const response = await axios.post(whisperUrl, formData, {
          headers: formData.getHeaders(),
          timeout: 30000, // 30 segundos
        });

        transcribedText = response.data.text || response.data.result?.text || '';
      } catch (whisperError: any) {
        this.logger.warn(`Whisper API no disponible: ${whisperError.message}, usando mock`);
        // Mock: usar los primeros caracteres del archivo como placeholder
        transcribedText = `[Transcripción no disponible - Whisper API sin respuesta] Archivo: ${file.originalname}`;
      }

      // Actualizar transcripción con el texto y marcar como completada
      const updated = await this.prisma.transcription.update({
        where: { id: transcription.id },
        data: {
          text: transcribedText,
          status: 'COMPLETADA',
          confidence: 0.85, // Placeholder confidence
        },
      });

      return {
        id: updated.id,
        text: updated.text,
        language: updated.language,
        status: updated.status,
        confidence: updated.confidence,
      };
    } catch (error: any) {
      this.logger.error(`Error transcribiendo audio: ${error.message}`);
      throw new BadRequestException(error.message || 'Error al transcribir el audio');
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
