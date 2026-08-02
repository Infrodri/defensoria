import { Module } from '@nestjs/common';
import { SocialToolsService } from './social-tools.service';
import { SocialToolsController } from './social-tools.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [KnowledgeModule],
  providers: [SocialToolsService, PrismaService, CaseAccessService],
  controllers: [SocialToolsController],
  exports: [SocialToolsService],
})
export class SocialToolsModule {}
