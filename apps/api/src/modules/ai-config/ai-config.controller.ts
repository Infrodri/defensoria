import { Controller, Get, Put, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiConfigService, AiConfigDto } from './ai-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@defensoria/shared';

@ApiTags('Configuración de IA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller('ai-config')
export class AiConfigController {
  constructor(private readonly configService: AiConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración actual de la IA' })
  getConfig() {
    return this.configService.getConfig();
  }

  @Put()
  @ApiOperation({ summary: 'Actualizar configuración de la IA' })
  updateConfig(@Body() dto: AiConfigDto, @Req() req: any) {
    return this.configService.updateConfig(dto, req.user.id);
  }

  @Get('models')
  @ApiOperation({ summary: 'Listar modelos disponibles en el Ollama local' })
  async getModels() {
    return { models: await this.configService.getLocalModels() };
  }

  @Get('health')
  @ApiOperation({ summary: 'Verificar estado de los servicios de IA' })
  getHealth() {
    return this.configService.getHealth();
  }

  @Post('start-services')
  @ApiOperation({ summary: 'Iniciar servicios de IA (solo producción)' })
  startServices() {
    return this.configService.startServices();
  }
}
