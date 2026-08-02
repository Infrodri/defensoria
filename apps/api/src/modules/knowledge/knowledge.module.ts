import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { EmbeddingsService } from './embeddings.service';

@Module({
  controllers: [KnowledgeController],
  providers: [KnowledgeService, EmbeddingsService],
})
export class KnowledgeModule {}
