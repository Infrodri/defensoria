import { Module } from '@nestjs/common';
import { SpecViolenciaSexualILEService } from './spec-violencia-sexual-ile.service';
import { SpecViolenciaSexualILEController } from './spec-violencia-sexual-ile.controller';

@Module({
  controllers: [SpecViolenciaSexualILEController],
  providers: [SpecViolenciaSexualILEService],
  exports: [SpecViolenciaSexualILEService],
})
export class SpecViolenciaSexualILEModule {}
