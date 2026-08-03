import { Module } from '@nestjs/common';
import { QuestionnairesService } from './questionnaires.service';
import { QuestionnairesController } from './questionnaires.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [QuestionnairesService, PrismaService],
  controllers: [QuestionnairesController],
  exports: [QuestionnairesService],
})
export class QuestionnairesModule {}
