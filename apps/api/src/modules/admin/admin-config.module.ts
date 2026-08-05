import { Module } from '@nestjs/common';
import { AdminConfigService } from './admin-config.service';
import { AdminConfigController } from './admin-config.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessModule } from '../../common/case-access/case-access.module';

@Module({
  imports: [CaseAccessModule],
  providers: [AdminConfigService, PrismaService],
  controllers: [AdminConfigController],
  exports: [AdminConfigService],
})
export class AdminConfigModule {}