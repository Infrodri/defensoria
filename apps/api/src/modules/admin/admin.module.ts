import { Module } from '@nestjs/common';
import { AdminUsersModule } from './admin-users.module';
import { AdminKnowledgeModule } from './admin-knowledge.module';
import { AdminConfigModule } from './admin-config.module';

@Module({
  imports: [AdminUsersModule, AdminKnowledgeModule, AdminConfigModule],
})
export class AdminModule {}