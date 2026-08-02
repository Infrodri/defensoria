import { Module } from '@nestjs/common';
import { LegalToolsService } from './legal-tools.service';
import { LegalToolsController } from './legal-tools.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';

@Module({
  providers: [LegalToolsService, PrismaService, CaseAccessService],
  controllers: [LegalToolsController],
  exports: [LegalToolsService],
})
export class LegalToolsModule {}
