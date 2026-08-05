import { Module } from '@nestjs/common';
import { ConciliationAgreementsService } from './conciliation-agreements.service';
import { ConciliationAgreementsController } from './conciliation-agreements.controller';

@Module({
  controllers: [ConciliationAgreementsController],
  providers: [ConciliationAgreementsService],
  exports: [ConciliationAgreementsService],
})
export class ConciliationAgreementsModule {}
