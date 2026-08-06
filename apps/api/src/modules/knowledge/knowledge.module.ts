import { Module, forwardRef } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { EmbeddingsService } from './embeddings.service';
import { RAGService } from './rag.service';
import { TranscriptionService } from './transcription.service';
import { ToolsAdminService } from './tools-admin.service';
import { ToolsAdminController } from './tools-admin.controller';
import { MinioModule } from '../minio/minio.module';
import { EvidencesModule } from '../evidences/evidences.module';

@Module({
  imports: [MinioModule, forwardRef(() => EvidencesModule)],
  controllers: [KnowledgeController, ToolsAdminController],
  providers: [KnowledgeService, EmbeddingsService, RAGService, TranscriptionService, ToolsAdminService],
  exports: [RAGService, EmbeddingsService, TranscriptionService, ToolsAdminService],
})
export class KnowledgeModule {}
