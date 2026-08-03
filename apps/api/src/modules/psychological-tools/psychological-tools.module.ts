import { Module } from '@nestjs/common';
import { PsychologicalToolsService } from './psychological-tools.service';
import { PsychologicalToolsController } from './psychological-tools.controller';
import { PrismaService } from '../prisma/prisma.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [KnowledgeModule],
  providers: [PsychologicalToolsService, PrismaService],
  controllers: [PsychologicalToolsController],
  exports: [PsychologicalToolsService],
})
export class PsychologicalToolsModule {}
