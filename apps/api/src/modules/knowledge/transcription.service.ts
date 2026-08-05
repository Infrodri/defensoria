import { Injectable, Logger, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { EmbeddingsService } from './embeddings.service';
import { AiTaskLockService } from '../ai-task-lock/ai-task-lock.service';
import axios from 'axios';
import FormData = require('form-data');

// Prompt de análisis de imagen (descripción + OCR) para peritos forenses
const IMAGE_ANALYSIS_PROMPT = `Analizá minuciosamente esta imagen en español para un expediente de la Defensoría de la Niñez y Adolescencia de Bolivia.

1. EXTRACCIÓN DE TEXTO / OCR: Si la imagen contiene texto escrito (manuscritos, cartas, capturas de pantalla de chats de WhatsApp, certificados, documentos fotografiados, letreros), transcribe TODO el texto legible de forma exacta. Si no hay texto visible, indicá "Sin texto visible".

2. DESCRIPCIÓN VISUAL Y ENTORNO: Describí objetivamente lo que se observa (entorno, estado del lugar, objetos, personas sin nombrarlas, posibles indicadores de violencia o vulneración).

Sé profesional, preciso y detallado como un perito forense.`;

@Injectable()
export class TranscriptionService implements OnModuleInit {
  private readonly logger = new Logger(TranscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
    private embeddings: EmbeddingsService,
    private aiTaskLock: AiTaskLockService,
  ) {}

  /**
   * Al iniciar el backend, re-encola los PENDIENTES huérfanos para continuar
   * el procesamiento en segundo plano donde quedó (independiente del navegador).
   */
  async onModuleInit() {
    try {
      await this.restorePendingQueue();
    } catch (err: any) {
      this.logger.warn(`[AiTasks] No se pudo restaurar la cola al iniciar: ${err.message}`);
    }
  }

  /**
   * Buscar dentro de una transcripción
   */
  async searchInTranscription(
    caseId: string,
    query: string,
  ): Promise<
    Array<{
      transcriptionId: string;
      text: string;
      matchedText: string;
      position: number;
    }>
  > {
    try {
      // Buscar usando PostgreSQL full-text search
      const results = await this.prisma.$queryRaw<
        Array<{
          id: string;
          text: string;
          matched_text: string;
          position: number;
        }>
      >`
        SELECT 
          t.id,
          t.text,
          SUBSTRING(t.text FROM POSITION($2 IN t.text) FOR LENGTH($2) + 50) as matched_text,
          POSITION($2 IN LOWER(t.text)) as position
        FROM transcriptions t
        WHERE t."caseId" = $1::uuid
          AND LOWER(t.text) LIKE LOWER('%' || $2 || '%')
        ORDER BY position ASC
      `;

      return results.map((r) => ({
        transcriptionId: r.id,
        text: r.text.substring(0, 500),
        matchedText: r.matched_text,
        position: r.position,
      }));
    } catch (error) {
      this.logger.error(`Error buscando en transcripción: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtener transcripciones completadas de un caso
   */
  async getTranscriptionsForCase(
    caseId: string,
  ): Promise<
    Array<{
      id: string;
      text: string;
      language: string;
      status: string;
    }>
  > {
    return this.prisma.transcription.findMany({
      where: {
        caseId,
        status: 'COMPLETADA',
      },
      select: {
        id: true,
        text: true,
        language: true,
        status: true,
      },
    });
  }

  /**
   * Obtener la primera transcripción completada del caso
   */
  async getLatestTranscriptionForCase(caseId: string) {
    return this.prisma.transcription.findFirst({
      where: {
        caseId,
        status: 'COMPLETADA',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Transcribir un archivo de audio usando Whisper API.
   * Crea el registro PENDIENTE y lo encola en el serializador global
   * (una petición de IA a la vez). Devuelve el estado de la cola.
   */
  async transcribeAudioFile(
    caseId: string,
    evidenceId: string | undefined,
    file: Express.Multer.File,
    userId?: string,
  ) {
    // Verificar si ya existe transcripción para este evidenceId
    const existing = await this.prisma.transcription.findFirst({
      where: { evidenceId: evidenceId || `audio-${Date.now()}` },
      orderBy: { createdAt: 'desc' },
    });

    // Si ya existe y está completada o pendiente, retornar la existente
    if (existing && (existing.status === 'COMPLETADA' || existing.status === 'PENDIENTE' || existing.status === 'PROCESSING')) {
      return {
        id: existing.id,
        text: existing.text,
        language: existing.language,
        status: existing.status,
        confidence: existing.confidence,
        alreadyExists: true,
        position: this.aiTaskLock.getPosition(existing.id),
      };
    }

    // Crear entrada de transcripción en estado PENDIENTE (el worker la toma)
    const transcription = await this.prisma.transcription.create({
      data: {
        caseId,
        evidenceId: evidenceId || `audio-${Date.now()}`,
        text: '',
        status: 'PENDIENTE',
        language: 'es',
        confidence: 0,
        createdBy: userId,
      },
    });

    // Encolar el trabajo real en el serializador (procesa uno por uno)
    const buffer = Buffer.from(file.buffer);
    const mimetype = file.mimetype;
    const originalname = file.originalname;
    const queued = this.aiTaskLock.enqueue(
      transcription.id,
      'Transcripción de audio (Whisper)',
      evidenceId || originalname,
      async () => {
        await this.runTranscribeJob(transcription.id, caseId, evidenceId, buffer, mimetype, originalname);
      },
    );

    return {
      id: transcription.id,
      text: '',
      language: 'es',
      status: 'PENDIENTE',
      confidence: 0,
      queued: queued.queued,
      position: queued.position,
    };
  }

  /** Ejecuta la transcripción real de un trabajo de la cola. */
  private async runTranscribeJob(
    transcriptionId: string,
    caseId: string,
    evidenceId: string | undefined,
    buffer: Buffer,
    mimetype: string,
    originalname: string,
  ) {
    // Marcar como en procesamiento
    await this.prisma.transcription.update({
      where: { id: transcriptionId },
      data: { status: 'PROCESSING', confidence: 0.1 },
    });

    const whisperUrl = process.env.WHISPER_API_URL || 'http://localhost:8000/v1/audio/transcriptions';

    const formData = new FormData();
    formData.append('file', buffer, {
      filename: originalname,
      contentType: mimetype,
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'es');

    let transcribedText = '';
    try {
      const response = await axios.post(whisperUrl, formData, {
        headers: formData.getHeaders(),
        // Whisper en CPU es lento; 10+ minutos de audio puede tardar mucho.
        timeout: parseInt(process.env.WHISPER_TIMEOUT_MS || '900000', 10), // 15 min default
      });
      transcribedText = response.data.text || response.data.result?.text || '';
    } catch (whisperError: any) {
      this.logger.warn(`Whisper API no disponible: ${whisperError.message}`);
      await this.prisma.transcription.update({
        where: { id: transcriptionId },
        data: {
          text: '',
          status: 'ERROR',
          confidence: 0,
          errorMessage: 'Whisper no disponible',
        },
      });
      throw new BadRequestException(
        'El servicio de transcripción de audio (Whisper) no está disponible temporalmente. Por favor, asegurate de que el servicio esté encendido.',
      );
    }

    if (!transcribedText || transcribedText.trim().length === 0) {
      await this.prisma.transcription.update({
        where: { id: transcriptionId },
        data: {
          text: '',
          status: 'ERROR',
          confidence: 0,
          errorMessage: 'Sin texto extraíble',
        },
      });
      throw new BadRequestException('No se pudo extraer texto del archivo de audio.');
    }

    // Actualizar transcripción con el texto y marcar como completada
    await this.prisma.transcription.update({
      where: { id: transcriptionId },
      data: {
        text: transcribedText,
        status: 'COMPLETADA',
        confidence: 0.9,
      },
    });
    this.logger.log(`[AiTasks] Transcripción COMPLETADA: ${evidenceId || originalname} (${transcribedText.length} chars)`);
  }

  /**
   * Obtener transcripción por evidenceId (cualquier estado)
   */
  async getTranscriptionStatusByEvidenceId(evidenceId: string) {
    return this.prisma.transcription.findFirst({
      where: { evidenceId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        text: true,
        status: true,
        language: true,
        confidence: true,
        createdAt: true,
      },
    });
  }

  /**
   * Analizar una imagen existente (descripción + OCR) con el modelo de visión de Ollama.
   * Crea el registro PENDIENTE y lo encola en el serializador global
   * (una petición de IA a la vez). Devuelve el estado de la cola.
   */
  async analyzeImageByEvidenceId(
    evidenceId: string,
    userId?: string,
  ) {
    // Verificar si ya existe análisis para este evidenceId (idempotencia)
    const existing = await this.prisma.transcription.findFirst({
      where: { evidenceId },
      orderBy: { createdAt: 'desc' },
    });

    if (existing && (existing.status === 'COMPLETADA' || existing.status === 'PENDIENTE' || existing.status === 'PROCESSING')) {
      return {
        id: existing.id,
        text: existing.text,
        language: existing.language,
        status: existing.status,
        confidence: existing.confidence,
        alreadyExists: true,
        position: this.aiTaskLock.getPosition(existing.id),
      };
    }

    // Cargar evidencia (validación temprana antes de encolar)
    const evidence = await this.prisma.evidence.findUnique({ where: { id: evidenceId } });
    if (!evidence) {
      throw new BadRequestException('Evidencia no encontrada');
    }
    if (!evidence.mimeType.startsWith('image/')) {
      throw new BadRequestException(`No es una imagen: ${evidence.mimeType}`);
    }

    // Crear registro PENDIENTE (el worker la toma y procesa uno por uno)
    const transcription = await this.prisma.transcription.create({
      data: {
        caseId: evidence.caseId,
        evidenceId,
        text: '',
        status: 'PENDIENTE',
        language: 'es',
        confidence: 0,
        createdBy: userId || '00000000-0000-0000-0000-000000000000',
      },
    });

    // Encolar el trabajo real en el serializador
    const queued = this.aiTaskLock.enqueue(
      transcription.id,
      'Análisis de imagen (Ollama visión)',
      evidence.fileName || evidence.id,
      async () => {
        await this.runAnalyzeImageJob(transcription.id, evidenceId);
      },
    );

    return {
      id: transcription.id,
      text: '',
      language: 'es',
      status: 'PENDIENTE',
      confidence: 0,
      queued: queued.queued,
      position: queued.position,
    };
  }

  /** Ejecuta el análisis de imagen real de un trabajo de la cola. */
  private async runAnalyzeImageJob(transcriptionId: string, evidenceId: string) {
    // Marcar como en procesamiento
    await this.prisma.transcription.update({
      where: { id: transcriptionId },
      data: { status: 'PROCESSING', confidence: 0.1 },
    });

    // Cargar evidencia + binario desde MinIO
    const evidence = await this.prisma.evidence.findUnique({ where: { id: evidenceId } });
    if (!evidence) {
      await this.markError(transcriptionId, 'Evidencia no encontrada');
      return;
    }

    const stream = await this.minio.getFileStream(evidence.storagePath);
    const buffer = await this.streamToBuffer(stream);

    // Llamar a Ollama vision (modelo configurable desde el panel admin)
    const { endpoint: ollamaEndpoint, model: visionModel } = await this.getVisionModelConfig();
    const base64Image = buffer.toString('base64');

    let analysisText = '';
    try {
      const response = await axios.post(
        `${ollamaEndpoint}/api/generate`,
        {
          model: visionModel,
          prompt: IMAGE_ANALYSIS_PROMPT,
          images: [base64Image],
          stream: false,
        },
        {
          timeout: parseInt(process.env.OLLAMA_VISION_TIMEOUT_MS || '300000', 10), // 5 min default
        },
      );
      analysisText = response.data.response || '';
    } catch (visionErr: any) {
      this.logger.warn(`Ollama vision no disponible: ${visionErr.message}`);
      await this.markError(transcriptionId, 'Ollama no disponible');
      throw new BadRequestException(
        'El servicio de análisis de imágenes (Ollama) no está disponible temporalmente. Por favor, asegurate de que el servicio esté encendido.',
      );
    }

    if (!analysisText || analysisText.trim().length === 0) {
      await this.markError(transcriptionId, 'Sin descripción ni texto');
      throw new BadRequestException('No se pudo extraer descripción ni texto de la imagen.');
    }

    // Marcar COMPLETADA
    await this.prisma.transcription.update({
      where: { id: transcriptionId },
      data: {
        text: analysisText,
        status: 'COMPLETADA',
        confidence: 0.85,
      },
    });

    // Indexar en RAG del expediente (case_chunks)
    try {
      await this.indexImageChunk(evidence.caseId, evidenceId, analysisText, evidence.fileName);
    } catch (ragErr: any) {
      this.logger.warn(`[RAG] No se pudo indexar imagen ${evidenceId}: ${ragErr.message}`);
    }
    this.logger.log(`[AiTasks] Análisis de imagen COMPLETADA: ${evidenceId} (${analysisText.length} chars)`);
  }

  private async markError(transcriptionId: string, errorMessage: string) {
    await this.prisma.transcription.update({
      where: { id: transcriptionId },
      data: { text: '', status: 'ERROR', confidence: 0, errorMessage },
    });
  }

  /**
   * Encola todas las evidencias de un caso que no tienen análisis/transcripción
   * completada. Es el disparador "al abrir el caso": cada imagen entra en cola
   * para visión, cada audio/video para transcripción, procesadas una por una.
   * Devuelve resumen de lo encolado.
   */
  async enqueueCaseEvidences(caseId: string, userId?: string) {
    const evidences = await this.prisma.evidence.findMany({
      where: { caseId },
      select: { id: true, mimeType: true, fileName: true },
    });

    const results = { enqueued: 0, alreadyDone: 0, skipped: 0, total: evidences.length, queue: [] as any[] };
    const startedAt = Date.now();

    for (const ev of evidences) {
      const mime = (ev.mimeType || '').toLowerCase();

      // Solo imágenes y audio/video son candidatos de IA
      const isImage = mime.startsWith('image/');
      const isAudioVideo = mime.startsWith('audio/') || mime.startsWith('video/') || mime === 'application/octet-stream';
      if (!isImage && !isAudioVideo) {
        results.skipped++;
        continue;
      }

      // Idempotencia: si ya hay COMPLETADA/PENDIENTE/PROCESSING, no duplicar
      const existing = await this.prisma.transcription.findFirst({
        where: { evidenceId: ev.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true },
      });

      if (existing && existing.status !== 'ERROR') {
        results.alreadyDone++;
        results.queue.push({ evidenceId: ev.id, fileName: ev.fileName, status: existing.status, position: this.aiTaskLock.getPosition(existing.id) });
        continue;
      }

      // Crear PENDIENTE y encolar
      const transcription = await this.prisma.transcription.create({
        data: {
          caseId,
          evidenceId: ev.id,
          text: '',
          status: 'PENDIENTE',
          language: 'es',
          confidence: 0,
          createdBy: userId || '00000000-0000-0000-0000-000000000000',
        },
      });

      if (isImage) {
        const queued = this.aiTaskLock.enqueue(
          transcription.id,
          'Análisis de imagen (Ollama visión)',
          ev.fileName || ev.id,
          async () => {
            await this.runAnalyzeImageJob(transcription.id, ev.id);
          },
        );
        results.enqueued++;
        results.queue.push({ evidenceId: ev.id, fileName: ev.fileName, status: 'PENDIENTE', position: queued.position });
      } else {
        // Audio/video: el worker necesita el binario, que solo existe en la
        // subida. Si el archivo ya está en MinIO, lo leemos al ejecutar.
        const queued = this.aiTaskLock.enqueue(
          transcription.id,
          'Transcripción de audio (Whisper)',
          ev.fileName || ev.id,
          async () => {
            await this.runAudioFromMinio(transcription.id, ev.id);
          },
        );
        results.enqueued++;
        results.queue.push({ evidenceId: ev.id, fileName: ev.fileName, status: 'PENDIENTE', position: queued.position });
      }
    }

    this.logger.log(`[AiTasks] Caso ${caseId}: ${results.enqueued} encolados, ${results.alreadyDone} ya listos, ${results.skipped} sin IA. (${Date.now() - startedAt}ms)`);
    return results;
  }

  /**
   * Transcripción de audio/video ya subido a MinIO (cuando la evidencia se
   * creó sin transcripción en el momento de la carga).
   */
  private async runAudioFromMinio(transcriptionId: string, evidenceId: string) {
    const evidence = await this.prisma.evidence.findUnique({ where: { id: evidenceId } });
    if (!evidence) {
      await this.markError(transcriptionId, 'Evidencia no encontrada');
      return;
    }

    const stream = await this.minio.getFileStream(evidence.storagePath);
    const buffer = await this.streamToBuffer(stream);

    await this.runTranscribeJob(
      transcriptionId,
      evidence.caseId,
      evidenceId,
      buffer,
      evidence.mimeType || 'application/octet-stream',
      evidence.fileName,
    );
  }

  /**
   * Al iniciar el backend, re-encola los PENDIENTES huérfanos (quedaron en cola
   * de una sesión anterior) para que el worker continúe donde se quedó.
   */
  async restorePendingQueue(userId?: string) {
    const pending = await this.prisma.transcription.findMany({
      where: { status: 'PENDIENTE' },
      select: { id: true, evidenceId: true, caseId: true },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    for (const t of pending) {
      const evidence = await this.prisma.evidence.findUnique({
        where: { id: t.evidenceId },
        select: { mimeType: true, fileName: true },
      });
      if (!evidence) {
        await this.markError(t.id, 'Evidencia no encontrada');
        continue;
      }
      const mime = (evidence.mimeType || '').toLowerCase();
      if (mime.startsWith('image/')) {
        this.aiTaskLock.enqueue(t.id, 'Análisis de imagen (Ollama visión)', evidence.fileName || t.evidenceId, async () => {
          await this.runAnalyzeImageJob(t.id, t.evidenceId);
        });
      } else {
        this.aiTaskLock.enqueue(t.id, 'Transcripción de audio (Whisper)', evidence.fileName || t.evidenceId, async () => {
          await this.runAudioFromMinio(t.id, t.evidenceId);
        });
      }
    }
    if (pending.length > 0) {
      this.logger.log(`[AiTasks] Restaurados ${pending.length} trabajos PENDIENTES en la cola.`);
    }
  }

  /**
   * Listado de trabajos de IA (para el panel de monitoreo de cola).
   * Últimas 60 transcripciones con estado, posición en cola, caso y evidencia.
   */
  async listAiTasks() {
    const rows = await this.prisma.transcription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 60,
      include: {
        case: { select: { caseCode: true } },
        evidence: { select: { fileName: true, mimeType: true } },
      },
    });

    return rows.map((t) => {
      const mime = (t.evidence?.mimeType || '').toLowerCase();
      let type: 'imagen' | 'audio' = 'audio';
      if (mime.startsWith('image/')) type = 'imagen';
      else if (mime.startsWith('audio/') || mime.startsWith('video/')) type = 'audio';
      return {
        id: t.id,
        status: t.status,
        type,
        caseId: t.caseId,
        caseCode: t.case?.caseCode || `#${t.caseId.slice(0, 8)}`,
        evidenceId: t.evidenceId,
        fileName: t.evidence?.fileName || '',
        createdAt: t.createdAt,
        errorMessage: t.errorMessage,
        positionInQueue: this.aiTaskLock.getPosition(t.id),
      };
    });
  }

  /**
   * Reencola una tarea fallida (ERROR) o pendiente para re-procesarla.
   * No se puede reencolar una tarea en curso (PROCESSING).
   */
  async retryTask(id: string) {
    const t = await this.prisma.transcription.findUnique({
      where: { id },
      include: { evidence: { select: { mimeType: true, fileName: true } } },
    });
    if (!t) {
      throw new NotFoundException('Tarea de IA no encontrada');
    }
    if (t.status === 'PROCESSING') {
      throw new BadRequestException('La tarea está en curso; espere a que termine antes de reintentarla');
    }

    // Resetear a PENDIENTE y limpiar error anterior
    await this.prisma.transcription.update({
      where: { id },
      data: { status: 'PENDIENTE', errorMessage: null, confidence: 0 },
    });

    const mime = (t.evidence?.mimeType || '').toLowerCase();
    const ref = t.evidence?.fileName || t.evidenceId;
    let queued: { queued: boolean; position: number };

    if (mime.startsWith('image/')) {
      queued = this.aiTaskLock.enqueue(
        t.id,
        'Análisis de imagen (Ollama visión)',
        ref,
        async () => {
          await this.runAnalyzeImageJob(t.id, t.evidenceId);
        },
      );
    } else if (mime.startsWith('audio/') || mime.startsWith('video/')) {
      queued = this.aiTaskLock.enqueue(
        t.id,
        'Transcripción de audio (Whisper)',
        ref,
        async () => {
          await this.runAudioFromMinio(t.id, t.evidenceId);
        },
      );
    } else {
      await this.prisma.transcription.update({
        where: { id },
        data: {
          status: 'ERROR',
          errorMessage: `Tipo de evidencia no soportado para reintento: ${t.evidence?.mimeType || 'desconocido'}`,
        },
      });
      throw new BadRequestException(
        `No se pudo determinar el tipo de la evidencia (mimeType=${t.evidence?.mimeType}) para reencolar`,
      );
    }

    return { message: 'Tarea reencolada para re-procesamiento', position: queued.position, queueId: t.id };
  }

  /**
   * Cancela una tarea que aún está en cola (PENDIENTE), sacándola del worker.
   */
  async cancelTask(id: string) {
    const t = await this.prisma.transcription.findUnique({
      where: { id },
      select: { id: true, status: true, evidenceId: true },
    });
    if (!t) {
      throw new NotFoundException('Tarea de IA no encontrada');
    }
    if (t.status !== 'PENDIENTE') {
      throw new BadRequestException(
        'Solo se pueden cancelar tareas en cola (estado PENDIENTE). Si la tarea falló, use Reintentar.',
      );
    }

    const removed = this.aiTaskLock.dequeue(t.id);
    await this.prisma.transcription.update({
      where: { id },
      data: { status: 'ERROR', errorMessage: 'Cancelada manualmente por el administrador' },
    });

    return { message: 'Tarea cancelada y sacada de la cola', removed };
  }

  // ── Utilidades internas ────────────────────────────────────────────────────

  /**
   * Modelo de visión configurable desde el panel admin (systemSetting AI_MODEL_VISION
   * o OLLAMA_VISION_MODEL) con fallback a env y a gemma4-tasks:latest.
   */
  private async getVisionModelConfig() {
    const endpointSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'OLLAMA_ENDPOINT' },
    });
    const modelSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'AI_MODEL_VISION' },
    });
    const modelSettingAlt = await this.prisma.systemSetting.findUnique({
      where: { key: 'OLLAMA_VISION_MODEL' },
    });

    const endpoint = endpointSetting?.value || process.env.OLLAMA_URL || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    const model = modelSetting?.value || modelSettingAlt?.value || process.env.OLLAMA_VISION_MODEL || 'gemma4-tasks:latest';

    return { endpoint, model };
  }

  private streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Indexa el análisis de imagen en case_chunks para búsqueda semántica RAG.
   * Reutiliza el mismo sourceType que el pipeline de subida: 'image_description'.
   */
  private async indexImageChunk(
    caseId: string,
    evidenceId: string,
    content: string,
    fileName: string,
  ) {
    if (!content || content.trim().length < 10) return;

    let vectorStr: string | null = null;
    try {
      const vector = await this.embeddings.getEmbedding(content.slice(0, 4000));
      vectorStr = `[${vector.join(',')}]`;
    } catch (embedErr: any) {
      this.logger.warn(`[RAG] Embedding no disponible: ${embedErr.message}. Guardando sin vector.`);
    }

    const metadata = JSON.stringify({ fileName, source: 'vision_analysis' });

    try {
      if (vectorStr) {
        await this.prisma.$executeRaw`
          INSERT INTO case_chunks (id, "caseId", "evidenceId", "sourceType", content, metadata, embedding, "createdAt")
          VALUES (
            gen_random_uuid(),
            ${caseId}::uuid,
            ${evidenceId}::uuid,
            'image_description',
            ${content},
            ${metadata}::jsonb,
            ${vectorStr}::vector,
            NOW()
          )
        `;
      } else {
        await this.prisma.$executeRaw`
          INSERT INTO case_chunks (id, "caseId", "evidenceId", "sourceType", content, metadata, "createdAt")
          VALUES (
            gen_random_uuid(),
            ${caseId}::uuid,
            ${evidenceId}::uuid,
            'image_description',
            ${content},
            ${metadata}::jsonb,
            NOW()
          )
        `;
      }
      this.logger.log(`[RAG] Imagen indexada para caso ${caseId} (${content.length} chars)`);
    } catch (dbErr: any) {
      this.logger.error(`[RAG] Error guardando chunk de imagen en BD: ${dbErr.message}`);
    }
  }

  /**
   * Obtener transcripción completada por evidenceId
   */

  /**
   * Buscar en transcripciones de un caso
   */
  async searchInCaseTranscriptions(caseId: string, query: string) {
    const results = await this.searchInTranscription(caseId, query);
    return {
      query,
      results,
      count: results.length,
    };
  }
}
