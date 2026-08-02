import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { EmbeddingsService } from './embeddings.service';
import { RAGService } from './rag.service';

@Module({
  controllers: [KnowledgeController],
  providers: [KnowledgeService, EmbeddingsService, RAGService],
  exports: [RAGService, EmbeddingsService],
})
export class KnowledgeModule {}
