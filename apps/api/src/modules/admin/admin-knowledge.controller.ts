import { Controller, Get, Post, Body, Param, Delete, UseGuards, UploadedFile, ParseFilePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminKnowledgeService } from './admin-knowledge.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@defensoria/shared';

@ApiTags('Admin - Base de Conocimiento')
@Controller('admin/base-conocimiento')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminKnowledgeController {
  constructor(private readonly adminKnowledgeService: AdminKnowledgeService) {}

  @Get()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar documentos legales' })
  async listDocuments() {
    return this.adminKnowledgeService.listDocuments();
  }

  @Post('upload')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Subir documento legal con indexacin RAG automtica' })
  async uploadDocument(
    @Body('name') name: string,
    @Body('sourceUrl') sourceUrl: string | null,
    @Body('content') content: string | null,
    @Body('fileName') fileName: string,
  ) {
    return this.adminKnowledgeService.uploadDocument(name, sourceUrl, content, null, fileName);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar documento legal' })
  async deleteDocument(@Param('id') id: string) {
    return this.adminKnowledgeService.deleteDocument(id);
  }
}