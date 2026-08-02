import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiAssistantService } from './ai-assistant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

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
}
