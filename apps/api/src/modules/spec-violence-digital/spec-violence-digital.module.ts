import { Module } from '@nestjs/common';
import { SpecViolenceDigitalService } from './spec-violence-digital.service';
import { SpecViolenceDigitalController } from './spec-violence-digital.controller';

@Module({
  controllers: [SpecViolenceDigitalController],
  providers: [SpecViolenceDigitalService],
  exports: [SpecViolenceDigitalService],
})
export class SpecViolenceDigitalModule {}
