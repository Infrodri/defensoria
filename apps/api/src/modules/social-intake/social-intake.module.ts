import { Module } from '@nestjs/common';
import { SocialIntakeService } from './social-intake.service';
import { SocialIntakeController } from './social-intake.controller';

@Module({
  controllers: [SocialIntakeController],
  providers: [SocialIntakeService],
  exports: [SocialIntakeService],
})
export class SocialIntakeModule {}