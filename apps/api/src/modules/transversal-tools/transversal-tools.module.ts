import { Module } from '@nestjs/common';
import { TransversalToolsController } from './transversal-tools.controller';
import { TransversalToolsService } from './transversal-tools.service';
import { PrismaModule } from '../prisma/prisma.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [PrismaModule, KnowledgeModule],
  controllers: [TransversalToolsController],
  providers: [TransversalToolsService],
})
export class TransversalToolsModule {}
