import { Module } from '@nestjs/common';
import { QuestionnairesService } from './questionnaires.service';
import { QuestionnairesController } from './questionnaires.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';

@Module({
  providers: [QuestionnairesService, PrismaService, CaseAccessService],
  controllers: [QuestionnairesController],
  exports: [QuestionnairesService],
})
export class QuestionnairesModule {}
