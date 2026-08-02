import { Module } from '@nestjs/common';
import { SystemBackupController } from './system-backup.controller';
import { SystemBackupService } from './system-backup.service';

@Module({
  controllers: [SystemBackupController],
  providers: [SystemBackupService],
})
export class SystemBackupModule {}
