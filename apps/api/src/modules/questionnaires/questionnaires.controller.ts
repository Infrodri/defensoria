import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@defensoria/shared';
import { AccessUser } from '../../common/case-access/case-access.service';
import { QuestionnairesService } from './questionnaires.service';
import { CreateQuestionnnaireTemplateDto } from './dto/create-questionnaire-template.dto';
import { CreateResponseDto } from './dto/create-response.dto';

@ApiTags('Cuestionarios')
@Controller('questionnaires')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuestionnairesController {
  constructor(private questionnairesService: QuestionnairesService) {}

  /**
   * Listar cuestionarios disponibles
   */
  @Get('templates')
  @ApiOperation({ summary: 'Listar cuestionarios disponibles por categoría' })
  async listTemplates(
    @Query('category') category?: string,
  ) {
    return this.questionnairesService.listTemplates(category);
  }

  /**
   * Obtener preguntas de un cuestionario específico
   */
  @Get('templates/:id')
  @ApiParam({ name: 'id', description: 'ID del cuestionario' })
  @ApiOperation({ summary: 'Obtener estructura completa de un cuestionario' })
  async getTemplate(@Param('id') id: string) {
    return this.questionnairesService.getTemplate(id);
  }

  /**
   * Crear nueva plantilla de cuestionario (solo ADMINISTRADOR)
   */
  @Post('templates')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear nueva plantilla de cuestionario' })
  async createTemplate(
    @Body() dto: CreateQuestionnnaireTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionnairesService.createTemplate(dto, userId);
  }

  /**
   * Crear respuesta a un cuestionario
   */
  @Post('responses')
  @ApiOperation({
    summary: 'Crear respuesta a cuestionario vinculada a expediente',
    description: 'Crea una nueva respuesta pendiente que se puede completar después',
  })
  async createResponse(
    @Body() dto: CreateResponseDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.questionnairesService.createResponse(dto, user);
  }

  /**
   * Obtener respuestas completadas
   */
  @Get('responses/:id')
  @ApiParam({ name: 'id', description: 'ID de la respuesta' })
  @ApiOperation({ summary: 'Obtener respuestas completadas a un cuestionario' })
  async getResponse(@Param('id') id: string) {
    return this.questionnairesService.getResponse(id);
  }

  /**
   * Completar cuestionario y ejecutar análisis automático
   */
  @Post('responses/:id/submit')
  @ApiParam({ name: 'id', description: 'ID de la respuesta' })
  @ApiOperation({
    summary: 'Completar cuestionario con análisis automático de riesgos',
    description: 'Marca como completada la respuesta y ejecuta análisis que identifica banderas de riesgo',
  })
  async submitResponse(@Param('id') id: string) {
    return this.questionnairesService.submitResponse(id);
  }

  /**
   * Listar respuestas de un caso
   */
  @Get('cases/:caseId/responses')
  @ApiParam({ name: 'caseId', description: 'ID del expediente' })
  @ApiOperation({ summary: 'Listar todas las respuestas de un expediente' })
  async listResponsesByCase(
    @Param('caseId') caseId: string,
    @CurrentUser('id') userId: string,
  ) {
    // Validar acceso al caso
    return this.questionnairesService.listResponsesByCase(caseId);
  }

  /**
   * Marcar respuesta como revisada
   */
  @Post('responses/:id/review')
  @ApiParam({ name: 'id', description: 'ID de la respuesta' })
  @ApiOperation({
    summary: 'Marcar respuesta como revisada por supervisor',
  })
  async markAsReviewed(
    @Param('id') id: string,
    @CurrentUser() user: AccessUser,
  ) {
    return this.questionnairesService.markAsReviewed(id, user);
  }
}
