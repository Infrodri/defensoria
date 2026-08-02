import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);

  constructor(private prisma: PrismaService) {}

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
}
