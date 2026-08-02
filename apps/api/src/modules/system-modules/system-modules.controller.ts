import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemModulesService, CreateSystemModuleDto, UpdateSystemModuleDto } from './system-modules.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@defensoria/shared';

@ApiTags('System Modules')
@Controller('system-modules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SystemModulesController {
  constructor(private readonly systemModulesService: SystemModulesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los módulos y la matriz de permisos RBAC' })
  async findAll() {
    return this.systemModulesService.findAll();
  }

  @Post()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear un nuevo módulo en el sistema con matriz de permisos (Exclusivo Administrador)' })
  async create(@Body() dto: CreateSystemModuleDto) {
    return this.systemModulesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Editar nombre, descripción o matriz de permisos de un módulo (Exclusivo Administrador)' })
  async update(@Param('id') id: string, @Body() dto: UpdateSystemModuleDto) {
    return this.systemModulesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar módulo personalizado (Exclusivo Administrador)' })
  async remove(@Param('id') id: string) {
    return this.systemModulesService.remove(id);
  }
}
