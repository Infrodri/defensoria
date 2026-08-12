import { Global, Module, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PgBossService } from './pgboss.service';

@Global()
@Module({
  providers: [PgBossService],
  exports: [PgBossService],
})
export class PgBossModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PgBossModule.name);

  constructor(private readonly pgBossService: PgBossService) {}

  async onModuleInit() {
    await this.pgBossService.start();
    this.logger.log('PgBoss started successfully');
  }

  async onModuleDestroy() {
    await this.pgBossService.stop();
    this.logger.log('PgBoss stopped');
  }
}
