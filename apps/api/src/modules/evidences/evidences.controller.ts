import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { EvidencesService } from './evidences.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
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
  @ApiOperation({ summary: 'Listar archivos de evidencia del expediente con hash de integridad' })
  async findByCase(@Param('caseId') caseId: string) {
    return this.evidencesService.findByCase(caseId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Descargar archivo de evidencia desde MinIO' })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const { evidence, stream } = await this.evidencesService.getDownloadStream(id);

    res.setHeader('Content-Type', evidence.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${evidence.fileName}"`);

    stream.pipe(res);
  }
}
