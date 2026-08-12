import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PgBossService } from '../pgboss/pgboss.service';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { EmbeddingsService } from '../knowledge/embeddings.service';
import { EvidenceParserFactory } from './parsers/evidence-parser.factory';
import { RagProcessingStatus } from '@prisma/client';

export interface EvidenceJobPayload {
  caseId: string;
  evidenceId: string;
  mimeType: string;
  storagePath: string;
  originalName: string;
  description?: string;
}

const QUEUE_NAME = 'evidence-processing';

@Injectable()
export class EvidenceWorker implements OnModuleInit {
  private readonly logger = new Logger(EvidenceWorker.name);

  constructor(
    private readonly pgBoss: PgBossService,
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly embeddings: EmbeddingsService,
    private readonly parserFactory: EvidenceParserFactory,
  ) {}

  async onModuleInit() {
    await this.pgBoss.work<EvidenceJobPayload>(
      QUEUE_NAME,
      { teamConcurrency: 1 } as any,
      async (job) => this.handleJob(job),
    );
    this.logger.log('Evidence processing worker registered');
  }

  private async handleJob(job: { data: EvidenceJobPayload }): Promise<void> {
    const { caseId, evidenceId, mimeType, storagePath, originalName, description } = job.data;
    this.logger.log(`[Worker] Processing evidence ${evidenceId} (${mimeType})`);

    try {
      // 1. Mark as PROCESSING
      await this.prisma.evidence.update({
        where: { id: evidenceId },
        data: { ragStatus: RagProcessingStatus.PROCESSING },
      });

      // 2. Download file from MinIO
      const stream = await this.minio.getFileStream(storagePath);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);

      // 3. Get parser from factory
      const parser = this.parserFactory.getParser(mimeType);
      let textChunks: string[] = [];
      let sourceType = 'document_text';
      let metadata: Record<string, any> = { fileName: originalName, description };

      if (parser) {
        const parsed = await parser.parse(
          { buffer, originalname: originalName, mimetype: mimeType },
          description,
        );
        sourceType = parsed.sourceType;
        metadata = { ...metadata, ...parsed.metadata };

        if (parsed.chunks && parsed.chunks.length > 0) {
          textChunks = parsed.chunks;
        } else if (parsed.text && parsed.text.trim().length > 10) {
          textChunks = [parsed.text];
        }
      } else {
        // Unsupported format — index description only
        const fallbackText = description || `Attached document: ${originalName}`;
        if (fallbackText.trim().length > 10) {
          textChunks = [fallbackText];
        }
      }

      // 4. Idempotency: delete previous chunks for this evidence
      await this.prisma.$executeRaw`
        DELETE FROM case_chunks WHERE "evidenceId" = ${evidenceId}::uuid
      `;

      // 5. Index each chunk with embedding
      for (let i = 0; i < textChunks.length; i++) {
        const content = textChunks[i];
        if (!content || content.trim().length < 10) continue;

        let vectorStr: string | null = null;
        try {
          const vector = await this.embeddings.getEmbedding(content.slice(0, 4000));
          vectorStr = `[${vector.join(',')}]`;
        } catch (embedErr: any) {
          this.logger.warn(`[Worker] Embedding unavailable: ${embedErr.message}. Saving without vector.`);
        }

        try {
          if (vectorStr) {
            await this.prisma.$executeRaw`
              INSERT INTO case_chunks (id, "caseId", "evidenceId", "sourceType", content, metadata, "chunkIndex", embedding, "createdAt")
              VALUES (
                gen_random_uuid(),
                ${caseId}::uuid,
                ${evidenceId}::uuid,
                ${sourceType},
                ${content},
                ${JSON.stringify(metadata)}::jsonb,
                ${i},
                ${vectorStr}::vector,
                NOW()
              )
            `;
          } else {
            await this.prisma.$executeRaw`
              INSERT INTO case_chunks (id, "caseId", "evidenceId", "sourceType", content, metadata, "chunkIndex", "createdAt")
              VALUES (
                gen_random_uuid(),
                ${caseId}::uuid,
                ${evidenceId}::uuid,
                ${sourceType},
                ${content},
                ${JSON.stringify(metadata)}::jsonb,
                ${i},
                NOW()
              )
            `;
          }
        } catch (dbErr: any) {
          this.logger.error(`[Worker] Error saving chunk to DB: ${dbErr.message}`);
        }
      }

      // 6. Mark as COMPLETED
      await this.prisma.evidence.update({
        where: { id: evidenceId },
        data: {
          ragStatus: RagProcessingStatus.COMPLETED,
          ragProcessedAt: new Date(),
          ragError: null,
        },
      });

      this.logger.log(`[Worker] Evidence ${evidenceId} processed: ${textChunks.length} chunks indexed`);
    } catch (err: any) {
      this.logger.error(`[Worker] Failed to process evidence ${evidenceId}: ${err.message}`);

      // Mark as FAILED
      try {
        await this.prisma.evidence.update({
          where: { id: evidenceId },
          data: {
            ragStatus: RagProcessingStatus.FAILED,
            ragError: err.message?.slice(0, 500),
          },
        });
      } catch (updateErr: any) {
        this.logger.error(`[Worker] Could not update evidence status: ${updateErr.message}`);
      }

      throw err; // Re-throw so pgboss retries
    }
  }
}
