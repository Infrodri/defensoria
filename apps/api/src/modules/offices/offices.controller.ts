import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OfficesService, CreateOfficeDto, UpdateOfficeDto } from './offices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@defensoria/shared';

@ApiTags('Offices')
@Controller('offices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las oficinas/distritos de la Defensoría' })
  async findAll() {
    return this.officesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de oficina con lista de personal y expedientes' })
  async findOne(@Param('id') id: string) {
    return this.officesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear nueva oficina o distrito (Exclusivo Administrador)' })
  async create(@Body() dto: CreateOfficeDto) {
    return this.officesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar datos de una oficina o distrito (Exclusivo Administrador)' })
  async update(@Param('id') id: string, @Body() dto: UpdateOfficeDto) {
    return this.officesService.update(id, dto);
  }
}
