import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

import { KnowledgeModule } from '../knowledge/knowledge.module';
import { EvidencesModule } from '../evidences/evidences.module';

@Module({
  imports: [KnowledgeModule, EvidencesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
