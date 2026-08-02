import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { EmbeddingsService } from './embeddings.service';
import { RAGService } from './rag.service';
import { TranscriptionService } from './transcription.service';
import { ToolsAdminService } from './tools-admin.service';
import { ToolsAdminController } from './tools-admin.controller';

@Module({
  controllers: [KnowledgeController, ToolsAdminController],
  providers: [KnowledgeService, EmbeddingsService, RAGService, TranscriptionService, ToolsAdminService],
  exports: [RAGService, EmbeddingsService, TranscriptionService, ToolsAdminService],
})
export class KnowledgeModule {}
