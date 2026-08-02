import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DisciplinesService } from './disciplines.service';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';
import { CreateReportTypeDto } from './dto/create-report-type.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@defensoria/shared';

@ApiTags('Disciplines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('disciplines')
export class DisciplinesController {
  constructor(private readonly disciplinesService: DisciplinesService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear una nueva disciplina (Solo Administrador)' })
  create(@Body() createDisciplineDto: CreateDisciplineDto) {
    return this.disciplinesService.create(createDisciplineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las disciplinas' })
  findAll() {
    return this.disciplinesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una disciplina' })
  findOne(@Param('id') id: string) {
    return this.disciplinesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar una disciplina (Solo Administrador)' })
  update(@Param('id') id: string, @Body() updateDisciplineDto: UpdateDisciplineDto) {
    return this.disciplinesService.update(id, updateDisciplineDto);
  }

  @Post(':id/report-types')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Agregar un tipo de informe a una disciplina (Solo Administrador)' })
  addReportType(
    @Param('id') id: string,
    @Body() createReportTypeDto: CreateReportTypeDto,
  ) {
    return this.disciplinesService.addReportType(id, createReportTypeDto);
  }
}
