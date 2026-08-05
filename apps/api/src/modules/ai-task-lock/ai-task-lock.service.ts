import { Injectable, Logger } from '@nestjs/common';

type JobFactory = () => Promise<void>;

interface QueueJob {
  id: string;
  task: string;
  ref: string;
  run: JobFactory;
}

/**
 * Serializador de cola global in-process para tareas de IA pesadas
 * (transcripción Whisper, análisis de imagen Ollama, indexado RAG con visión).
 *
 * Garantiza "una petición a la vez, en cola FIFO": si llega un trabajo mientras
 * otro corre, se encola y se ejecuta en orden, sin saturar la GPU/CPU local.
 * SINGLETON por proceso.
 */
@Injectable()
export class AiTaskLockService {
  private readonly logger = new Logger(AiTaskLockService.name);
  private queue: QueueJob[] = [];
  private running: { id: string; task: string; ref: string; startedAt: Date } | null = null;
  private readonly maxRunMs = parseInt(process.env.AI_TASK_MAX_LOCK_MS || '2700000', 10); // 45 min

  /**
   * Encola un trabajo. Devuelve { queued, position } donde position es la
   * cantidad de trabajos pendientes delante de este (0 = arranca al toque).
   */
  enqueue(id: string, task: string, ref: string, run: JobFactory): { queued: boolean; position: number } {
    if (this.queue.some((j) => j.id === id) || this.running?.id === id) {
      return { queued: false, position: this.getPosition(id) };
    }

    this.queue.push({ id, task, ref, run });
    this.logger.log(`[AiTasks] ${task} (${ref}) encolado. Cola: ${this.queue.length}.`);
    void this.pump();

    return { queued: true, position: this.getPosition(id) };
  }

  /** Saca la tarea dada de la cola (cancelación manual). */
  dequeue(id: string): boolean {
    const before = this.queue.length;
    this.queue = this.queue.filter((j) => j.id !== id);
    return this.queue.length < before;
  }

  /** Posición en cola: 0 = en ejecución o próximo, -1 = no está. */
  getPosition(id: string): number {
    if (this.running?.id === id) return 0;
    const idx = this.queue.findIndex((j) => j.id === id);
    return idx >= 0 ? idx : -1;
  }

  getStatus() {
    const queue = this.queue.map((j) => ({ id: j.id, task: j.task, ref: j.ref }));
    if (!this.running) {
      return { busy: false, queueLength: this.queue.length, queue };
    }
    return {
      busy: true,
      task: this.running.task,
      ref: this.running.ref,
      startedAt: this.running.startedAt,
      elapsedSeconds: Math.round((Date.now() - this.running.startedAt.getTime()) / 1000),
      queueLength: this.queue.length,
      queue,
    };
  }

  // ── Motor interno ──────────────────────────────────────────────────────────

  private async pump() {
    if (this.running) return;
    const next = this.queue.shift();
    if (!next) return;

    this.running = { task: next.task, ref: next.ref, id: next.id, startedAt: new Date() };
    this.logger.log(`[AiTasks] EJECUTANDO: ${next.task} (${next.ref}). Quedan ${this.queue.length} en cola.`);

    const job = this.running;
    const watchdog = setTimeout(() => {
      if (this.running && Date.now() - job.startedAt.getTime() > this.maxRunMs) {
        this.logger.error(`[AiTasks] ${job.task} (${job.ref}) excedió ${this.maxRunMs}ms. Forzando liberación.`);
        this.finish();
        void this.pump();
      }
    }, this.maxRunMs);

    try {
      await next.run();
    } catch (err: any) {
      this.logger.warn(`[AiTasks] ${next.task} (${next.ref}) terminó con error: ${err.message}`);
    } finally {
      clearTimeout(watchdog);
      this.finish();
      void this.pump(); // procesar el siguiente de la cola
    }
  }

  private finish() {
    this.running = null;
    this.logger.log(`[AiTasks] Tarea finalizada. Restantes en cola: ${this.queue.length}`);
  }
}