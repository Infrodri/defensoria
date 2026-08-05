import { Global, Module } from '@nestjs/common';
import { AiTaskLockService } from './ai-task-lock.service';

@Global()
@Module({
  providers: [AiTaskLockService],
  exports: [AiTaskLockService],
})
export class AiTaskLockModule {}
