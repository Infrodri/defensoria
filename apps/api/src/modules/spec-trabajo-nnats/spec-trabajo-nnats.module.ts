import { Module } from '@nestjs/common';
import { SpecTrabajoNNATSService } from './spec-trabajo-nnats.service';
import { SpecTrabajoNNATSController } from './spec-trabajo-nnats.controller';

@Module({
  controllers: [SpecTrabajoNNATSController],
  providers: [SpecTrabajoNNATSService],
  exports: [SpecTrabajoNNATSService],
})
export class SpecTrabajoNNATSModule {}
