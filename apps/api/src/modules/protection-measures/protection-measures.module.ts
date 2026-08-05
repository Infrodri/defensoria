import { Module } from '@nestjs/common';
import { ProtectionMeasuresService } from './protection-measures.service';
import { ProtectionMeasuresController } from './protection-measures.controller';

@Module({
  controllers: [ProtectionMeasuresController],
  providers: [ProtectionMeasuresService],
  exports: [ProtectionMeasuresService],
})
export class ProtectionMeasuresModule {}
