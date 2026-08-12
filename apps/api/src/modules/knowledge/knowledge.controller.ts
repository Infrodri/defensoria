import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Get, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeService } from './knowledge.service';
import { TranscriptionService } from './transcription.service';
import { EvidenceRagService } from '../evidences/evidence-rag.service';
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
    private readonly evidenceRag: EvidenceRagService,
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
  @ApiOperation({ summary: 'Transcribir una evidencia ya almacenada (por ID)' })
  async transcribeByEvidenceId(
    @Body('caseId') caseId: string,
    @Body('evidenceId') evidenceId: string,
    @CurrentUser() user?: any,
  ) {
    if (!caseId) throw new BadRequestException('Se requiere caseId');
    if (!evidenceId) throw new BadRequestException('Se requiere evidenceId');

    try {
      return await this.transcriptionService.transcribeByEvidenceId(caseId, evidenceId, user?.id);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al transcribir el audio');
    }
  }

  @Post('transcribe-upload')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA, Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL)
  @ApiOperation({ summary: 'Subir archivo de audio para transcribir (multipart)' })
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

    const audioMimeTypes = [
      'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/x-m4a',
      'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac',
      'video/mp4', 'video/quicktime',
    ];
    if (!audioMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Tipo de audio no soportado: ${file.mimetype}`);
    }

    try {
      return await this.transcriptionService.transcribeAudioFile(caseId, evidenceId, file, user?.id);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al transcribir el audio');
    }
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

  @Post('case-search')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA, Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL)
  @ApiOperation({ summary: 'Búsqueda semántica en el RAG del expediente (transcripciones, PDFs, imágenes, informes previos)' })
  async searchCaseContext(
    @Body('caseId') caseId: string,
    @Body('query') query: string,
    @Body('limit') limit?: number,
  ) {
    if (!caseId) throw new BadRequestException('Se requiere caseId');
    if (!query) throw new BadRequestException('Se requiere query');

    try {
      const context = await this.evidenceRag.searchCaseContext(caseId, query, limit || 8);
      return { caseId, query, context, hasContext: context.trim().length > 0 };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al buscar en el expediente');
    }
  }

  @Get('pipeline/status')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA)
  @ApiOperation({ summary: 'Estado del pipeline RAG — estadísticas de chunks indexados (Admin/Jefatura)' })
  async getPipelineStatus() {
    try {
      return await this.evidenceRag.getPipelineStatus();
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al obtener estado del pipeline');
    }
  }

  @Get('pipeline/status/:caseId')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA, Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL)
  @ApiOperation({ summary: 'Estado del pipeline RAG para un expediente específico' })
  async getPipelineStatusByCase(@Param('caseId') caseId: string) {
    try {
      return await this.evidenceRag.getPipelineStatus(caseId);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al obtener estado del pipeline');
    }
  }
}
