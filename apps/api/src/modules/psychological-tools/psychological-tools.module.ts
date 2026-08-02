import { Module } from '@nestjs/common';
import { PsychologicalToolsService } from './psychological-tools.service';
import { PsychologicalToolsController } from './psychological-tools.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';

@Module({
  providers: [PsychologicalToolsService, PrismaService, CaseAccessService],
  controllers: [PsychologicalToolsController],
  exports: [PsychologicalToolsService],
})
export class PsychologicalToolsModule {}
