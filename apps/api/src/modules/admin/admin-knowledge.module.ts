import { Module } from '@nestjs/common';
import { AdminKnowledgeService } from './admin-knowledge.service';
import { AdminKnowledgeController } from './admin-knowledge.controller';
import { PrismaService } from '../prisma/prisma.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { CaseAccessModule } from '../../common/case-access/case-access.module';

@Module({
  imports: [KnowledgeModule, CaseAccessModule],
  providers: [AdminKnowledgeService, PrismaService],
  controllers: [AdminKnowledgeController],
  exports: [AdminKnowledgeService],
})
export class AdminKnowledgeModule {}