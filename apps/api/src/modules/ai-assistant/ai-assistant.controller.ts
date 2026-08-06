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

  @Post('chat')
  @ApiOperation({ summary: 'Chat de coordinación interdisciplinaria. Si se pasa caseId, el asistente lee el contenido real del expediente (transcripciones, PDFs, imágenes, informes previos).' })
  async chat(@Body() body: { message: string; caseId?: string }) {
    const response = await this.aiService.chat(body.message, body.caseId);
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
