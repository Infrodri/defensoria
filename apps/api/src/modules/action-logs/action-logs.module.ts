import { Module } from '@nestjs/common';
import { ActionLogsService } from './action-logs.service';
import { ActionLogsController } from './action-logs.controller';

@Module({
  controllers: [ActionLogsController],
  providers: [ActionLogsService],
  exports: [ActionLogsService],
})
export class ActionLogsModule {}
