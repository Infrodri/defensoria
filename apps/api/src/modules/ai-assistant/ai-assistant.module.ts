import { Module } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantController } from './ai-assistant.controller';
import { EvidencesModule } from '../evidences/evidences.module';
import { CaseAccessModule } from '../../common/case-access/case-access.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [EvidencesModule, CaseAccessModule, KnowledgeModule],
  controllers: [AiAssistantController],
  providers: [AiAssistantService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
