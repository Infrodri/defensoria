import { Controller, Get, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@defensoria/shared';
import { ToolsAdminService, ToolsHealthReport } from './tools-admin.service';

@ApiTags('Tools Admin - Verificación y Aprobación')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tools-admin')
export class ToolsAdminController {
  constructor(private readonly toolsAdminService: ToolsAdminService) {}

  @Get('health')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Health check de todas las herramientas Phase 2',
    description: 'Verifica el status de Ollama, RAG, Whisper, Transcriptions, y Bases de Conocimiento',
  })
  async getToolsHealth(): Promise<ToolsHealthReport> {
    try {
      const health = await this.toolsAdminService.checkAllToolsHealth();
      return health;
    } catch (error: any) {
      throw new HttpException(
        {
          message: 'Error checking tools health',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Estado detallado de las herramientas y servicios',
    description: 'Retorna información detallada sobre cada herramienta: versión, última ejecución, casos analizados, etc.',
  })
  async getToolsStatus(): Promise<any> {
    try {
      const status = await this.toolsAdminService.getDetailedStatus();
      return status;
    } catch (error: any) {
      throw new HttpException(
        {
          message: 'Error getting tools status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('approve')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Aprobar herramientas como funcionales',
    description: 'El admin confirma que las herramientas están funcionando correctamente',
  })
  async approveTools(@Body('notes') notes?: string): Promise<any> {
    try {
      const approval = await this.toolsAdminService.approveTools(notes);
      return approval;
    } catch (error: any) {
      throw new HttpException(
        {
          message: 'Error approving tools',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('approval-history')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Historial de aprobaciones de herramientas',
    description: 'Lista todas las aprobaciones realizadas por admins',
  })
  async getApprovalHistory() {
    try {
      const history = await this.toolsAdminService.getApprovalHistory();
      return history;
    } catch (error: any) {
      throw new HttpException(
        {
          message: 'Error getting approval history',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('test-tools')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Ejecutar tests en vivo de todas las herramientas',
    description: 'Corre un test completo: transcripción + análisis legal + psicológico + social + transversal',
  })
  async runLiveTests() {
    try {
      const results = await this.toolsAdminService.runLiveToolTests();
      return results;
    } catch (error: any) {
      throw new HttpException(
        {
          message: 'Error running live tests',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
