import { Module, forwardRef } from '@nestjs/common';
import { EvidencesService } from './evidences.service';
import { EvidencesController } from './evidences.controller';
import { EvidenceRagService } from './evidence-rag.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [forwardRef(() => KnowledgeModule)],
  controllers: [EvidencesController],
  providers: [EvidencesService, EvidenceRagService],
  exports: [EvidencesService, EvidenceRagService],
})
export class EvidencesModule {}
