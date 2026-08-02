import { Module } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { CaseAccessService } from '../../common/case-access/case-access.service';

@Module({
  controllers: [CasesController],
  providers: [CasesService, CaseAccessService],
  exports: [CasesService],
})
export class CasesModule {}
