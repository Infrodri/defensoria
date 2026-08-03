import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Put,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  ForbiddenException,
  MethodNotAllowedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { EvidencesService } from './evidences.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Evidences')
@Controller('evidences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EvidencesController {
  constructor(private readonly evidencesService: EvidencesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir evidencia con hash SHA-256 de integridad probatoria a MinIO' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string' },
        isSensitive: { type: 'boolean', default: false },
        description: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: any,
    @Body('caseId') caseId: string,
    @Body('isSensitive') isSensitive: string,
    @Body('description') description: string,
    @CurrentUser('id') userId: string,
  ) {
    if (!caseId) {
      throw new BadRequestException('El ID del expediente (caseId) es requerido');
    }

    const sensitiveBool = isSensitive === 'true' || isSensitive === '1';

    return this.evidencesService.uploadEvidence(
      caseId,
      file,
      userId,
      sensitiveBool,
      description,
    );
  }

  @Get('case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Listar archivos de evidencia del expediente con hash de integridad' })
  async findByCase(@Param('caseId') caseId: string) {
    return this.evidencesService.findByCase(caseId);
  }

  @Get(':id/download')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Descargar o reproducir archivo de evidencia desde MinIO' })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const { evidence, stream } = await this.evidencesService.getDownloadStream(id);

    // Cabeceras de inmutabilidad: no permitir borrado ni sobreescritura desde cliente
    res.setHeader('Content-Type', evidence.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${evidence.fileName}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    stream.pipe(res);
  }

  // ─── Endpoints de mutación BLOQUEADOS explícitamente ─────────────────────────
  // Estos métodos existen para que cualquier intento de DELETE/PATCH/PUT sobre
  // evidencias devuelva 405 Method Not Allowed en lugar de 404, dejando trazas
  // claras en los logs de auditoría.

  @Delete(':id')
  @ApiOperation({ summary: '[BLOQUEADO] Las evidencias son inmutables' })
  async deleteEvidence() {
    throw new MethodNotAllowedException(
      'Las evidencias forman parte de la cadena de custodia y no pueden ser eliminadas. ' +
      'Este intento ha sido registrado en el sistema de auditoría.',
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: '[BLOQUEADO] Las evidencias son inmutables' })
  async patchEvidence() {
    throw new MethodNotAllowedException(
      'Las evidencias no pueden ser modificadas una vez subidas.',
    );
  }

  @Put(':id')
  @ApiOperation({ summary: '[BLOQUEADO] Las evidencias son inmutables' })
  async putEvidence() {
    throw new MethodNotAllowedException(
      'Las evidencias no pueden ser reemplazadas una vez subidas.',
    );
  }
}
