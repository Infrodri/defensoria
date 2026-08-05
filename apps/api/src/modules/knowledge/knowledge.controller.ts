import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Get, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeService } from './knowledge.service';
import { TranscriptionService } from './transcription.service';
import { AiTaskLockService } from '../ai-task-lock/ai-task-lock.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@defensoria/shared';
import { ValidateMarkdownDto } from './dto/validate-markdown.dto';

@ApiTags('Knowledge Base (Plano A)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('knowledge')
export class KnowledgeController {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly transcriptionService: TranscriptionService,
    private readonly aiTaskLock: AiTaskLockService,
  ) {}

  @Post('ingest')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Ingresar documento legal a la base de conocimiento (Plano A)' })
  ingestDocument(@Body() dto: { title: string; chunks: { content: string; metadata: any }[] }) {
    return this.knowledgeService.ingestDocument(dto.title, dto.chunks);
  }

  @Post('upload')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Subir un PDF legal para extraer y procesar (Opción A local)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' }
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File, @Body('title') title: string) {
    if (!file) throw new BadRequestException('Se requiere un archivo PDF');
    if (file.mimetype !== 'application/pdf') throw new BadRequestException('Solo se admiten archivos PDF');
    if (!title) throw new BadRequestException('El título es requerido');

    try {
      return await this.knowledgeService.processPdf(title, file.buffer);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al procesar el archivo PDF');
    }
  }

  @Post('upload-url')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Extraer y procesar documento desde una URL web' })
  async uploadUrl(@Body('title') title: string, @Body('url') url: string) {
    if (!title) throw new BadRequestException('El título es requerido');
    if (!url || !url.startsWith('http')) throw new BadRequestException('Se requiere una URL válida (http/https)');

    try {
      return await this.knowledgeService.processUrl(title, url);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al procesar la URL');
    }
  }

  @Post('upload-markdown')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Subir un archivo Markdown (.md) pre-estructurado (Opción recomendada para máxima calidad)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' }
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadMarkdown(@UploadedFile() file: Express.Multer.File, @Body('title') title: string) {
    if (!file) throw new BadRequestException('Se requiere un archivo Markdown');
    if (!file.originalname.endsWith('.md') && file.mimetype !== 'text/markdown') {
      throw new BadRequestException('Solo se admiten archivos Markdown (.md)');
    }
    if (!title) throw new BadRequestException('El título es requerido');

    try {
      const markdownContent = file.buffer.toString('utf-8');
      return await this.knowledgeService.processMarkdown(title, markdownContent);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al procesar el archivo Markdown');
    }
  }

  @Get('documents')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA)
  @ApiOperation({ summary: 'Listar todos los documentos legales indexados' })
  async getDocuments() {
    return this.knowledgeService.getDocuments();
  }

  @Get('documents/:id/chunks')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA)
  @ApiOperation({ summary: 'Listar fragmentos indexados de un documento' })
  async getDocumentChunks(@Param('id') id: string) {
    return this.knowledgeService.getDocumentChunks(id);
  }

  @Patch('documents/:id/toggle-status')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Activar/Desactivar documento (para dar de baja leyes derogadas)' })
  async toggleDocumentStatus(@Param('id') id: string) {
    return this.knowledgeService.toggleDocumentStatus(id);
  }

  @Delete('documents/:id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar permanentemente documento y sus embeddings' })
  async deleteDocument(@Param('id') id: string) {
    try {
      return await this.knowledgeService.deleteDocument(id);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al eliminar el documento');
    }
  }

  @Post('validate-markdown')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA)
  @ApiOperation({ summary: 'Validar formato de Markdown antes de ingestar (Preview)' })
  async validateMarkdown(@Body() dto: ValidateMarkdownDto) {
    try {
      return await this.knowledgeService.validateMarkdown(dto.content);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al validar Markdown');
    }
  }

  @Post('transcribe')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA, Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL)
  @ApiOperation({ summary: 'Subir audio para transcribir y generar análisis' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        caseId: { type: 'string' },
        evidenceId: { type: 'string', description: 'ID de la evidencia asociada (opcional)' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async transcribeAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body('caseId') caseId: string,
    @Body('evidenceId') evidenceId?: string,
    @CurrentUser() user?: any,
  ) {
    if (!file) throw new BadRequestException('Se requiere un archivo de audio');
    if (!caseId) throw new BadRequestException('Se requiere caseId');

    // Validar que el archivo es audio o video (Whisper acepta ambos)
    const mediaMimeTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/x-m4a',
      'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/webm', 'audio/x-aiff',
      'video/mp4', 'video/x-m4v', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
    ];
    if (!mediaMimeTypes.includes(file.mimetype) && file.mimetype !== 'application/octet-stream') {
      throw new BadRequestException(`Tipo de audio/video no soportado: ${file.mimetype}`);
    }

    try {
      return await this.transcriptionService.transcribeAudioFile(
        caseId,
        evidenceId,
        file,
        user?.id,
      );
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al transcribir el audio');
    }
  }

  @Post('analyze-image')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA, Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL)
  @ApiOperation({ summary: 'Analizar imagen existente (descripción + OCR) e indexarla en el RAG del expediente' })
  async analyzeImage(
    @Body('evidenceId') evidenceId: string,
    @CurrentUser() user?: any,
  ) {
    if (!evidenceId) throw new BadRequestException('Se requiere evidenceId');

    try {
      return await this.transcriptionService.analyzeImageByEvidenceId(
        evidenceId,
        user?.id,
      );
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al analizar la imagen');
    }
  }

  @Post('queue-case')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA, Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL)
  @ApiOperation({ summary: 'Encolar todas las evidencias de un caso para procesamiento IA (una a la vez)' })
  async queueCase(
    @Body('caseId') caseId: string,
    @CurrentUser() user?: any,
  ) {
    if (!caseId) throw new BadRequestException('Se requiere caseId');
    return this.transcriptionService.enqueueCaseEvidences(caseId, user?.id);
  }

  @Get('ai-status')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA, Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL)
  @ApiOperation({ summary: 'Estado del procesamiento de IA (una petición a la vez)' })
  aiStatus() {
    return this.aiTaskLock.getStatus();
  }

  @Get('ai-tasks')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA, Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL)
  @ApiOperation({ summary: 'Listado de trabajos de IA encolados/recientes con posición en la cola' })
  async getAiTasks() {
    const [worker, tasks] = await Promise.all([
      this.aiTaskLock.getStatus(),
      this.transcriptionService.listAiTasks(),
    ]);
    return { worker, tasks };
  }

  @Post('ai-tasks/:id/retry')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA)
  @ApiOperation({ summary: 'Reencolar una tarea de IA fallida (o pendiente) para re-procesar' })
  async retryTask(@Param('id') id: string) {
    return this.transcriptionService.retryTask(id);
  }

  @Post('ai-tasks/:id/cancel')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA)
  @ApiOperation({ summary: 'Cancelar una tarea de IA que aún está en cola (PENDIENTE)' })
  async cancelTask(@Param('id') id: string) {
    return this.transcriptionService.cancelTask(id);
  }

  @Post('search-transcriptions')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA, Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL)
  @ApiOperation({ summary: 'Buscar en transcripciones de un caso' })
  async searchTranscriptions(
    @Body('caseId') caseId: string,
    @Body('query') query: string,
  ) {
    if (!caseId) throw new BadRequestException('Se requiere caseId');
    if (!query) throw new BadRequestException('Se requiere query');

    try {
      return await this.transcriptionService.searchInCaseTranscriptions(caseId, query);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al buscar en transcripciones');
    }
  }

  @Get('transcription/evidence/:evidenceId')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA, Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL)
  @ApiOperation({ summary: 'Obtener transcripción completada por ID de evidencia' })
  async getTranscriptionByEvidenceId(@Param('evidenceId') evidenceId: string) {
    const transcription = await this.transcriptionService.getTranscriptionStatusByEvidenceId(evidenceId);
    if (!transcription || transcription.status !== 'COMPLETADA') {
      throw new NotFoundException('No se encontró transcripción completada para esta evidencia');
    }
    return transcription;
  }

  @Get('transcription/status/:evidenceId')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA, Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL)
  @ApiOperation({ summary: 'Obtener estado de transcripción por ID de evidencia' })
  async getTranscriptionStatus(@Param('evidenceId') evidenceId: string) {
    const transcription = await this.transcriptionService.getTranscriptionStatusByEvidenceId(evidenceId);
    if (!transcription) {
      return { status: 'NO_INICIADA', evidenceId };
    }
    return {
      id: transcription.id,
      status: transcription.status,
      language: transcription.language,
      confidence: transcription.confidence,
      createdAt: transcription.createdAt,
      hasText: !!transcription.text && transcription.text.length > 0,
    };
  }
}
