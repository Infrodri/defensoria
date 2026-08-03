import { Module } from '@nestjs/common';
import { SocialToolsService } from './social-tools.service';
import { SocialToolsController } from './social-tools.controller';
import { PrismaService } from '../prisma/prisma.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [KnowledgeModule],
  providers: [SocialToolsService, PrismaService],
  controllers: [SocialToolsController],
  exports: [SocialToolsService],
})
export class SocialToolsModule {}
