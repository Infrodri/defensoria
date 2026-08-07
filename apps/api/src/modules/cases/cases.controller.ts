import { Controller, Get, Post, Patch, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { AssignTeamDto } from './dto/assign-team.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@defensoria/shared';

@ApiTags('Cases')
@Controller('cases')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @Roles(Role.SECRETARIA, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Registrar nuevo expediente (Exclusivo Secretaría, Jefatura y Administrador)' })
  async create(
    @Body() dto: CreateCaseDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('officeId') officeId: string,
  ) {
    return this.casesService.create(dto, userId, officeId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar expedientes (Filtrado por rol y asignación activa)' })
  async findAll(@CurrentUser() user: any) {
    return this.casesService.findAll(user);
  }

  @Get('analytics')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener métricas y estadísticas agregadas del sistema (No nominal)' })
  async getAnalytics() {
    return this.casesService.getAnalytics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de expediente con historial de equipo y oficina' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.casesService.findOne(id, user);
  }

  @Post(':id/assign')
  @Roles(Role.JEFATURA, Role.SECRETARIA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Asignar o reasignar profesional al equipo del caso (Registra historial)' })
  async assignTeam(
    @Param('id') caseId: string,
    @Body() dto: AssignTeamDto,
    @CurrentUser('id') assignedByUserId: string,
  ) {
    return this.casesService.assignTeam(caseId, dto, assignedByUserId);
  }

  @Post(':id/generate-pin')
  @Roles(Role.JEFATURA, Role.SECRETARIA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Generar o regenerar PIN de acceso para el tutor (Exclusivo Secretaría, Jefatura y Administrador)' })
  async generatePin(@Param('id') caseId: string) {
    return this.casesService.generateAccessPin(caseId);
  }

  @Post('admin/mass-transfer')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Reasignar masivamente expedientes de un profesional a otro (Solo Administrador)' })
  async massTransfer(
    @Body() dto: { fromUserId: string; toUserId: string; reason: string },
    @CurrentUser('id') assignedByUserId: string,
  ) {
    return this.casesService.massTransfer(dto, assignedByUserId);
  }

  // NUEVO: Endpoints para sistema inmutable
  @Post(':id/disable')
  @Roles(Role.SECRETARIA, Role.JEFATURA)
  @ApiOperation({ summary: 'Inhabilitar expediente (Genera reporte para Jefatura)' })
  async disableCase(
    @Param('id') caseId: string,
    @Body() dto: { reason: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.casesService.disableCase(caseId, dto.reason, userId);
  }

  @Get('admin/disability-reports')
  @Roles(Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Ver reportes de expedientes inhabilitados (Solo Jefatura y Administradores)' })
  async getDisabilityReports(@CurrentUser() user: any) {
    return this.casesService.getDisabilityReports(user);
  }

  @Post('admin/disability-reports/:id/review')
  @Roles(Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Revisar y aprobar/rechazar reporte de inhabilitación' })
  async reviewDisabilityReport(
    @Param('id') reportId: string,
    @Body() dto: { status: 'APPROVED' | 'REJECTED' },
    @CurrentUser('id') userId: string,
  ) {
    return this.casesService.reviewDisabilityReport(reportId, userId, dto.status);
  }

  @Get(':id/record')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener registro consolidado del expediente (Caso + Ficha Social + Informes + Conciliación + Inspecciones + Evidencias + 8 Análisis IA)' })
  async getRecord(@Param('id') id: string, @CurrentUser() user: any) {
    return this.casesService.getRecord(id, user);
  }

  @Post(':id/sessions-plan')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Establecer cantidad de sesiones requeridas para la intervención del profesional en el expediente' })
  async updateRequiredSessions(
    @Param('id') caseId: string,
    @Body('requiredSessions') requiredSessions: number,
    @CurrentUser('id') userId: string,
  ) {
    return this.casesService.updateRequiredSessions(caseId, userId, requiredSessions);
  }

  @Get(':id/intervention-status')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener estado de avance de intervenciones de cada profesional asignado en la fase de Seguimiento' })
  async getInterventionStatus(@Param('id') caseId: string) {
    return this.casesService.getInterventionStatus(caseId);
  }

  @Patch(':id/phase/advance')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Verificar y avanzar la fase del expediente si se cumplen los requisitos' })
  async advancePhase(
    @Param('id') caseId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.casesService.advancePhaseIfReady(caseId, userId);
    return this.casesService.findOne(caseId, { id: userId, role: 'ADMINISTRADOR' as any, officeId: null });
  }

  @Get(':id/timeline')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Línea de tiempo procesal del expediente — todos los eventos ordenados por fecha' })
  async getTimeline(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.casesService.getTimeline(id, user);
  }
}
