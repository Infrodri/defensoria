import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService, CreateReportDto } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@defensoria/shared';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear borrador de informe profesional (Social, Psicológico, Jurídico)' })
  async create(
    @Body() dto: CreateReportDto,
    @CurrentUser('id') authorId: string,
    @CurrentUser('role') authorRole: Role,
  ) {
    return this.reportsService.create(dto, authorId, authorRole);
  }

  @Post(':id/emit')
  @ApiOperation({ summary: 'Emitir e inmutabilizar informe (Congela contenido e impone evaluación de riesgo)' })
  async emit(@Param('id') id: string, @CurrentUser('id') authorId: string) {
    return this.reportsService.emit(id, authorId);
  }

  @Post(':id/complementary')
  @ApiOperation({ summary: 'Crear informe complementario (v2, v3) sobre informe emitido' })
  async createComplementary(
    @Param('id') parentReportId: string,
    @Body('title') title: string,
    @Body('content') content: string,
    @CurrentUser('id') authorId: string,
    @CurrentUser('role') authorRole: Role,
  ) {
    return this.reportsService.createComplementary(parentReportId, content, title, authorId, authorRole);
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Obtener historial de informes (Filtrado por rol - SECRETARIA ve solo metadata)' })
  async findByCase(
    @Param('caseId') caseId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.reportsService.findByCaseForRole(caseId, userRole);
  }
}
