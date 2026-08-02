import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CasesService, CreateCaseDto, AssignTeamDto } from './cases.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
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
}
