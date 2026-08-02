import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiParam } from '@nestjs/swagger';
import {
  InspectionsService,
  CreateEstablishmentDto,
  CreateInspectionDto,
  CreateInspectionFindingDto,
} from './inspections.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Inspecciones & Fiscalización')
@Controller('inspections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post('establishments')
  @ApiOperation({ summary: 'Registrar establecimiento o punto de control a fiscalizar' })
  async createEstablishment(@Body() dto: CreateEstablishmentDto) {
    return this.inspectionsService.createEstablishment(dto);
  }

  @Get('establishments')
  @ApiOperation({ summary: 'Listar establecimientos registrados' })
  async listEstablishments() {
    return this.inspectionsService.listEstablishments();
  }

  @Post()
  @ApiOperation({
    summary: 'Programar o registrar operativo de inspección',
    description: 'Crea una nueva inspección (sorpresa o programada) vinculada a un caso',
  })
  async createInspection(
    @Body() dto: CreateInspectionDto,
    @CurrentUser('id') inspectorId: string,
    @CurrentUser('officeId') officeId: string,
  ) {
    return this.inspectionsService.createInspection(dto, inspectorId, officeId, inspectorId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar operativos de inspección' })
  async listInspections(@Query('caseId') caseId?: string) {
    return this.inspectionsService.listInspections(caseId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID de la inspección' })
  @ApiOperation({ summary: 'Obtener detalles completos de una inspección' })
  async getInspection(@Param('id') id: string) {
    return this.inspectionsService.getInspection(id);
  }

  /**
   * NUEVO: Agregar ubicación GPS
   */
  @Post(':id/location')
  @ApiParam({ name: 'id', description: 'ID de la inspección' })
  @ApiOperation({ summary: 'Registrar ubicación GPS de la inspección' })
  async addLocation(
    @Param('id') inspectionId: string,
    @Body()
    dto: {
      latitude: number;
      longitude: number;
      address: string;
      googleMapsUrl?: string;
    },
  ) {
    return this.inspectionsService.addLocation(inspectionId, dto);
  }

  /**
   * NUEVO: Subir archivos de evidencia
   */
  @Post(':id/evidence-files')
  @ApiParam({ name: 'id', description: 'ID de la inspección' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir archivo de evidencia (foto, video, documento)',
    description: 'Registra fotos, videos o documentos de la inspección sorpresa',
  })
  async uploadEvidenceFile(
    @Param('id') inspectionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description: string,
    @Body('evidenceType') evidenceType: 'FOTO' | 'VIDEO' | 'DOCUMENTO',
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new Error('Archivo no proporcionado');
    }

    return this.inspectionsService.uploadEvidenceFile(
      inspectionId,
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      description,
      evidenceType,
      userId,
    );
  }

  /**
   * NUEVO: Obtener archivos de evidencia
   */
  @Get(':id/evidence-files')
  @ApiParam({ name: 'id', description: 'ID de la inspección' })
  @ApiOperation({ summary: 'Listar archivos de evidencia (fotos, videos) de una inspección' })
  async getEvidenceFiles(@Param('id') inspectionId: string) {
    return this.inspectionsService.getEvidenceFiles(inspectionId);
  }

  /**
   * NUEVO: Registrar hallazgos estructurados
   */
  @Post(':id/findings')
  @ApiParam({ name: 'id', description: 'ID de la inspección' })
  @ApiOperation({
    summary: 'Registrar hallazgo estructurado',
    description: 'Registra hallazgos con categoría, severidad y recomendaciones',
  })
  async addFinding(@Param('id') inspectionId: string, @Body() dto: CreateInspectionFindingDto) {
    return this.inspectionsService.addFinding(inspectionId, dto);
  }

  /**
   * NUEVO: Obtener hallazgos
   */
  @Get(':id/findings')
  @ApiParam({ name: 'id', description: 'ID de la inspección' })
  @ApiOperation({ summary: 'Listar hallazgos registrados' })
  async getFindings(@Param('id') inspectionId: string) {
    return this.inspectionsService.getFindings(inspectionId);
  }

  /**
   * NUEVO: Completar inspección
   */
  @Post(':id/complete')
  @ApiParam({ name: 'id', description: 'ID de la inspección' })
  @ApiOperation({ summary: 'Marcar inspección como completada' })
  async completeInspection(@Param('id') inspectionId: string) {
    return this.inspectionsService.completeInspection(inspectionId);
  }
}
