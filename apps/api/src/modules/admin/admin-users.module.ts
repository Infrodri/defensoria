import { Module } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessModule } from '../../common/case-access/case-access.module';

@Module({
  imports: [CaseAccessModule],
  providers: [AdminUsersService, PrismaService],
  controllers: [AdminUsersController],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}