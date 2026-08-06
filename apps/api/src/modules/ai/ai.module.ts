import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { EvidencesModule } from '../evidences/evidences.module';

@Module({
  imports: [KnowledgeModule, EvidencesModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
