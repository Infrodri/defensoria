import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CasesService, CreateCaseDto, AssignTeamDto } from './cases.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RlsContextInterceptor } from '../../common/interceptors/rls-context.interceptor';
import { Role } from '@defensoria/shared';

@ApiTags('Cases')
@Controller('cases')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(RlsContextInterceptor)
@ApiBearerAuth()
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @Roles(Role.SECRETARIA, Role.JEFATURA)
  @ApiOperation({ summary: 'Registrar nuevo expediente (Exclusivo Secretaría y Jefatura)' })
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

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de expediente con historial de equipo y oficina' })
  async findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Post(':id/assign')
  @Roles(Role.JEFATURA, Role.SECRETARIA)
  @ApiOperation({ summary: 'Asignar o reasignar profesional al equipo del caso (Registra historial)' })
  async assignTeam(
    @Param('id') caseId: string,
    @Body() dto: AssignTeamDto,
    @CurrentUser('id') assignedByUserId: string,
  ) {
    return this.casesService.assignTeam(caseId, dto, assignedByUserId);
  }
}
