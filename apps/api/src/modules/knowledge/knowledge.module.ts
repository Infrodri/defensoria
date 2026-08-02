import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { EmbeddingsService } from './embeddings.service';
import { RAGService } from './rag.service';
import { TranscriptionService } from './transcription.service';

@Module({
  controllers: [KnowledgeController],
  providers: [KnowledgeService, EmbeddingsService, RAGService, TranscriptionService],
  exports: [RAGService, EmbeddingsService, TranscriptionService],
})
export class KnowledgeModule {}
