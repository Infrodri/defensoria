import { Module } from '@nestjs/common';
import { TravelPermissionsService } from './travel-permissions.service';
import { TravelPermissionsController } from './travel-permissions.controller';

@Module({
  controllers: [TravelPermissionsController],
  providers: [TravelPermissionsService],
  exports: [TravelPermissionsService],
})
export class TravelPermissionsModule {}
