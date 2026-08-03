import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConciliationService, ScheduleHearingDto, RecordResultDto } from './conciliation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Conciliation')
@Controller('api/conciliation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConciliationController {
  constructor(private readonly conciliationService: ConciliationService) {}

  @Post(':caseId/evaluate')
  @ApiOperation({ summary: 'Evaluar la conciliabilidad de un caso' })
  async evaluate(@Param('caseId') caseId: string, @CurrentUser('id') userId: string) {
    return this.conciliationService.evaluateConciliability(caseId, userId);
  }

  @Post(':caseId/schedule')
  @ApiOperation({ summary: 'Programar audiencia de conciliación' })
  async schedule(
    @Param('caseId') caseId: string,
    @Body() dto: ScheduleHearingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.conciliationService.scheduleHearing(caseId, dto, userId);
  }

  @Post(':processId/result')
  @ApiOperation({ summary: 'Registrar resultado de la audiencia de conciliación' })
  async recordResult(
    @Param('processId') processId: string,
    @Body() dto: RecordResultDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.conciliationService.recordResult(processId, dto, userId);
  }

  @Get('case/:caseId/evaluation')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener evaluación de conciliabilidad de un caso' })
  async getEvaluation(@Param('caseId') caseId: string) {
    return this.conciliationService.getEvaluationByCaseId(caseId);
  }

  @Get('case/:caseId/processes')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener procesos de conciliación de un caso' })
  async getProcesses(@Param('caseId') caseId: string) {
    return this.conciliationService.getProcessesByCaseId(caseId);
  }
}