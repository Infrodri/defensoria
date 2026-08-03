import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@defensoria/shared';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('professionals/list')
  @ApiOperation({ summary: 'Listar profesionales disponibles para asignación (accesible a todos)' })
  async listProfessionals(
    @Query('role') role?: string,
  ) {
    return this.usersService.listProfessionals(role as Role);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA)
  @ApiOperation({ summary: 'Listar todos los funcionarios del sistema (Exclusivo Administrador y Jefatura) - Filtrable por rol e isActive' })
  async findAll(
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.usersService.findAll({
      role: role as Role,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA)
  @ApiOperation({ summary: 'Obtener detalle de funcionario y casos asignados' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA)
  @ApiOperation({ summary: 'Registrar nuevo funcionario (Exclusivo Administrador y Jefatura)' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA)
  @ApiOperation({ summary: 'Actualizar funcionario (rol, distrito, estado)' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Post(':id/reset-password')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA)
  @ApiOperation({ summary: 'Restablecer contraseña de funcionario' })
  async resetPassword(@Param('id') id: string, @Body('password') password?: string) {
    return this.usersService.resetPassword(id, password);
  }
}
