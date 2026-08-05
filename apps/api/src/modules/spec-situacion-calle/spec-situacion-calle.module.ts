import { Module } from '@nestjs/common';
import { SpecSituacionCalleService } from './spec-situacion-calle.service';
import { SpecSituacionCalleController } from './spec-situacion-calle.controller';

@Module({
  controllers: [SpecSituacionCalleController],
  providers: [SpecSituacionCalleService],
  exports: [SpecSituacionCalleService],
})
export class SpecSituacionCalleModule {}
