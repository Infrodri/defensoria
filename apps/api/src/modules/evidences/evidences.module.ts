import { Module } from '@nestjs/common';
import { EvidencesService } from './evidences.service';
import { EvidencesController } from './evidences.controller';
import { EvidenceRagService } from './evidence-rag.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { CaseAccessModule } from '../../common/case-access/case-access.module';

@Module({
  imports: [KnowledgeModule, CaseAccessModule],
  controllers: [EvidencesController],
  providers: [EvidencesService, EvidenceRagService],
  exports: [EvidencesService, EvidenceRagService],
})
export class EvidencesModule {}
