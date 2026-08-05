import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JefaturaService } from './jefatura.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@defensoria/shared';
import { AccessUser } from '../../common/case-access/case-access.service';
import { CloseCaseDto } from './dto/close-case.dto';
import { ReopenCaseDto } from './dto/reopen-case.dto';

@ApiTags('Jefatura')
@Controller('jefatura')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class JefaturaController {
  constructor(private readonly jefaturaService: JefaturaService) {}

  @Get('workload')
  @Roles(Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener supervisin de carga de trabajo por profesional' })
  async getWorkload(@CurrentUser() user: AccessUser) {
    return this.jefaturaService.getWorkload(user);
  }

  @Post('cases/:id/close')
  @Roles(Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Cerrar expediente con razn obligatoria' })
  async closeCase(
    @Param('id') caseId: string,
    @Body() dto: CloseCaseDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.jefaturaService.closeCase(caseId, dto.closureReason, user);
  }

  @Post('cases/:id/reopen')
  @Roles(Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Reabrir expediente con razn obligatoria' })
  async reopenCase(
    @Param('id') caseId: string,
    @Body() dto: ReopenCaseDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.jefaturaService.reopenCase(caseId, dto.reopenReason, user);
  }

  @Get('audit-logs')
  @Roles(Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener registro inmutable de auditora con filtros' })
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page', ParseIntPipe) page?: number,
    @Query('pageSize', ParseIntPipe) pageSize?: number,
  ) {
    return this.jefaturaService.getAuditLogs(userId, action, fromDate, toDate, page, pageSize);
  }
}