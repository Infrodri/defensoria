import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminConfigService } from './admin-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@defensoria/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessUser } from '../../common/case-access/case-access.service';

@ApiTags('Admin - Configuracin IA')
@Controller('admin/config-ia')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminConfigController {
  constructor(private readonly adminConfigService: AdminConfigService) {}

  @Get()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener configuracin actual de IA' })
  async getConfig() {
    return this.adminConfigService.getConfig();
  }

  @Put()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar configuracin de IA' })
  async updateConfig(@Body() dto: any, @CurrentUser() user: AccessUser) {
    return this.adminConfigService.updateConfig(dto, user.id);
  }

  @Get('health')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Verificar salud de servicios de IA' })
  async checkHealth() {
    return this.adminConfigService.checkAllHealth();
  }

  @Get('health/ollama')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Verificar salud de Ollama' })
  async checkOllama() {
    return this.adminConfigService.checkOllamaHealth();
  }

  @Get('health/whisper')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Verificar salud de Whisper' })
  async checkWhisper() {
    return this.adminConfigService.checkWhisperHealth();
  }
}