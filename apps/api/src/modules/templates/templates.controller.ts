import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@defensoria/shared';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear nueva plantilla (Solo Jefatura/Admin)' })
  create(@Body() createTemplateDto: any) {
    return this.templatesService.create(createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar plantillas' })
  findAll() {
    return this.templatesService.findAll();
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar una plantilla (Solo Administrador)' })
  update(@Param('id') id: string, @Body() updateTemplateDto: any) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar una plantilla (Solo Administrador)' })
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
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
  @ApiOperation({ summary: 'Subir archivo modelo/ejemplo para una plantilla (DOCX/PDF/MD)' })
  async uploadTemplateFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se adjuntó ningún archivo');
    return this.templatesService.uploadTemplateFile(id, file);
  }
}
