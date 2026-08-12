import { Injectable, Logger } from '@nestjs/common';
import PgBoss = require('pg-boss');

@Injectable()
export class PgBossService {
  private readonly logger = new Logger(PgBossService.name);
  private boss: PgBoss;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required for PgBoss');
    }
    this.boss = new PgBoss({
      connectionString: databaseUrl,
      retryLimit: 3,
      retryDelay: 10,
      retryBackoff: true,
      expireInMinutes: 60,
      archiveCompletedAfterSeconds: 3600, // Archive completed jobs after 1 hour
      deleteAfterDays: 7, // Clean up after 7 days
    });
  }

  async start(): Promise<void> {
    this.boss.on('error', (error) => {
      this.logger.error(`PgBoss error: ${error.message}`, error.stack);
    });
    this.boss.on('wip', (data) => {
      this.logger.debug(`[PgBoss] Work in progress: ${JSON.stringify(data)}`);
    });
    await this.boss.start();
  }

  async stop(): Promise<void> {
    await this.boss.stop({ graceful: true, timeout: 10000 });
  }

  /**
   * Send a job to a queue.
   */
  async send<T extends object>(
    queueName: string,
    data: T,
    options?: PgBoss.SendOptions,
  ): Promise<string | null> {
    const jobId = await this.boss.send(queueName, data, options);
    this.logger.log(`[Queue] Job ${jobId} sent to '${queueName}'`);
    return jobId;
  }

  /**
   * Register a worker for a queue.
   */
  async work<T extends object>(
    queueName: string,
    options: PgBoss.WorkOptions,
    handler: (job: PgBoss.Job<T>[] | PgBoss.Job<T> | any) => Promise<void>,
  ): Promise<string> {
    const workerId = await this.boss.work<T>(queueName, options, handler as PgBoss.WorkHandler<T>);
    this.logger.log(`[Worker] Registered worker '${workerId}' for queue '${queueName}'`);
    return workerId;
  }

  /**
   * Get the underlying PgBoss instance for advanced usage.
   */
  getInstance(): PgBoss {
    return this.boss;
  }
}
