import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { InstrumentsService } from './instruments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@defensoria/shared';

@ApiTags('Instruments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear nuevo instrumento (Solo Jefatura/Admin)' })
  create(@Body() createInstrumentDto: any) {
    return this.instrumentsService.create(createInstrumentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los instrumentos' })
  findAll() {
    return this.instrumentsService.findAll();
  }

  @Get('by-discipline/:disciplineCode')
  @ApiOperation({ summary: 'Listar instrumentos filtrados por disciplina' })
  @ApiParam({ name: 'disciplineCode', description: 'Código de disciplina (TRABAJO_SOCIAL, PSICOLOGIA, DERECHO)' })
  findByDiscipline(@Param('disciplineCode') disciplineCode: string) {
    return this.instrumentsService.findByDiscipline(disciplineCode);
  }
}
