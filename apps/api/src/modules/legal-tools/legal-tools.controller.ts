import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LegalToolsService } from './legal-tools.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessUser } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';
import { AnalyzeDiscrepanciesDto } from './dto/analyze-discrepancies.dto';
import { AnalyzeTypicalityDto } from './dto/analyze-typicality.dto';
import { CalculateDeadlineDto } from './dto/calculate-deadline.dto';

@ApiTags('Legal Tools')
@Controller('legal-tools')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LegalToolsController {
  constructor(private readonly legalToolsService: LegalToolsService) {}

  @Get('discrepancies/case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener análisis de discrepancias de un caso (lectura)' })
  async getDiscrepancies(@Param('caseId') caseId: string) {
    return this.legalToolsService.findDiscrepanciesByCaseId(caseId);
  }

  @Get('typicality/case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener análisis de tipicidad penal de un caso (lectura)' })
  async getTypicality(@Param('caseId') caseId: string) {
    return this.legalToolsService.findTypicalityByCaseId(caseId);
  }

  @Post('discrepancies/analyze')
  @Roles(Role.ABOGADO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Analizar discrepancias entre testimonios' })
  async analyzeDiscrepancies(
    @Body() dto: AnalyzeDiscrepanciesDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.legalToolsService.analyzeDiscrepancies(dto, user);
  }

  @Post('typicality/analyze')
  @Roles(Role.ABOGADO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Analizar tipicidad penal del relato' })
  async analyzeTypicality(
    @Body() dto: AnalyzeTypicalityDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.legalToolsService.analyzeTypicality(dto, user);
  }

  @Post('deadlines/calculate')
  @Roles(Role.ABOGADO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Calcular vencimientos procesales' })
  async calculateDeadlines(
    @Body() dto: CalculateDeadlineDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.legalToolsService.calculateDeadlines(dto, user);
  }
}
