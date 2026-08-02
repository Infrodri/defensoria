import { Module } from '@nestjs/common';
import { LegalToolsService } from './legal-tools.service';
import { LegalToolsController } from './legal-tools.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [KnowledgeModule],
  providers: [LegalToolsService, PrismaService, CaseAccessService],
  controllers: [LegalToolsController],
  exports: [LegalToolsService],
})
export class LegalToolsModule {}
