import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { TransversalToolsService } from './transversal-tools.service';
import { CreateUnifiedTimelineDto } from './dto/create-unified-timeline.dto';
import { AnonymizeReportDto } from './dto/anonymize-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@defensoria/shared';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Transversal Tools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transversal-tools')
export class TransversalToolsController {
  constructor(private readonly transversalToolsService: TransversalToolsService) {}

  @Post('timeline/unified')
  @Roles(Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Consolidates events from legal, psychological, and social into a unified timeline' })
  @ApiResponse({ status: 201, description: 'Unified timeline created/returned.' })
  async unifyTimeline(
    @Body() dto: CreateUnifiedTimelineDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.transversalToolsService.createUnifiedTimeline(dto.caseId, userId);
  }

  @Post('anonymizer/anonymize')
  @Roles(Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Anonymizes sensitive data in a report' })
  @ApiResponse({ status: 201, description: 'Report anonymized.' })
  async anonymizeReport(
    @Body() dto: AnonymizeReportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.transversalToolsService.anonymizeReport(dto.caseId, dto.reporteId, userId);
  }

  @Get('timeline/case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener línea de tiempo unificada de un caso (lectura)' })
  async getTimeline(@Param('caseId') caseId: string) {
    return this.transversalToolsService.findTimelineByCaseId(caseId);
  }

  @Get('anonymizer/case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener reportes anonimizados de un caso (lectura)' })
  async getAnonymized(@Param('caseId') caseId: string) {
    return this.transversalToolsService.findAnonymizedByCaseId(caseId);
  }
}
