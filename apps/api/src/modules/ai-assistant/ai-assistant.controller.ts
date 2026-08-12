import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiAssistantService } from './ai-assistant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI Assistant')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiAssistantController {
  constructor(private readonly aiService: AiAssistantService) {}

  @Post('draft-legal-document')
  @ApiOperation({ summary: 'Generar borrador de escrito legal usando IA local (Ollama)' })
  async draftLegalDocument(@Body('context') context: string) {
    const draft = await this.aiService.draftLegalDocument(context);
    return { draft };
  }

  @Post('analyze-risk')
  @ApiOperation({ summary: 'Analizar narrativa para extraer indicadores de riesgo usando IA local' })
  async analyzeRisk(@Body('narrative') narrative: string) {
    const analysis = await this.aiService.analyzeRisk(narrative);
    return { analysis };
  }

  @Post('chat-general')
  @ApiOperation({ summary: 'Chat de coordinación general (solo normativa legal). No puede acceder a datos de casos.' })
  async chatGeneral(@Body() body: { message: string }, @CurrentUser() user: any) {
    const response = await this.aiService.chatGeneral(body.message, user.role);
    return { response };
  }

  @Post('chat-case')
  @ApiOperation({ summary: 'Chat de coordinación de expediente. Combina normativa con contexto real del caso (transcripciones, informes, etc).' })
  async chatCase(@Body() body: { message: string; caseId: string }, @CurrentUser() user: any) {
    const response = await this.aiService.chatCase(body.message, body.caseId, user.id, user.role);
    return { response };
  }

  @Post('case/:caseId/assist-report')
  @ApiOperation({ summary: 'Asistente contextualizado para redacción de informes. Responde preguntas del profesional usando el contenido real del expediente.' })
  async assistReport(
    @Param('caseId') caseId: string,
    @Body() body: {
      reportCategory: string;
      question: string;
      partialContent?: string;
    },
  ) {
    if (!body.question) {
      return { response: 'Se requiere una pregunta.' };
    }
    const response = await this.aiService.assistReport(
      caseId,
      body.reportCategory,
      body.question,
      body.partialContent,
    );
    return { response };
  }
}
