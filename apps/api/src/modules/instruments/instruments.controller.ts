import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un instrumento (Solo Administrador)' })
  update(@Param('id') id: string, @Body() updateInstrumentDto: any) {
    return this.instrumentsService.update(id, updateInstrumentDto);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar un instrumento (Solo Administrador)' })
  remove(@Param('id') id: string) {
    return this.instrumentsService.remove(id);
  }

  @Post(':id/upload')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Subir archivo modelo/ejemplo para un instrumento' })
  async uploadInstrumentFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se adjuntó ningún archivo');
    return this.instrumentsService.uploadExampleFile(id, file);
  }

  async uploadInstrument(
    id: string,
    file: Express.Multer.File,
  ) {
    return this.uploadInstrumentFile(id, file);
  }
}

