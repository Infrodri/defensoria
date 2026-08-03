import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PsychologicalToolsService } from './psychological-tools.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessUser } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';
import { ExtractIndicatorsDto } from './dto/extract-indicators.dto';
import { PrefillRiskScalesDto } from './dto/prefill-risk-scales.dto';
import { TranslateClinicalDto } from './dto/translate-clinical.dto';
import { AnalyzeTraumaDto } from './dto/analyze-trauma.dto';

@ApiTags('Psychological Tools')
@Controller('psychological-tools')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PsychologicalToolsController {
  constructor(private readonly psychologicalToolsService: PsychologicalToolsService) {}

  @Post('indicators/extract')
  @Roles(Role.PSICOLOGO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Extraer indicadores de daño emocional y trauma score' })
  async extractIndicators(
    @Body() dto: ExtractIndicatorsDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.psychologicalToolsService.extractIndicators(dto, user);
  }

  @Post('risk-scales/prefill')
  @Roles(Role.PSICOLOGO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Pre-llenar escalas de riesgo psicológico' })
  async prefillRiskScales(
    @Body() dto: PrefillRiskScalesDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.psychologicalToolsService.prefillRiskScales(dto, user);
  }

  @Post('clinical-translator/translate')
  @Roles(Role.PSICOLOGO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Traducir notas clínicas a lenguaje forense' })
  async translateClinical(
    @Body() dto: TranslateClinicalDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.psychologicalToolsService.translateClinical(dto, user);
  }

  @Post('trauma/analyze')
  @Roles(Role.PSICOLOGO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Análisis de trauma acumulado' })
  async analyzeTrauma(
    @Body() dto: AnalyzeTraumaDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.psychologicalToolsService.analyzeTrauma(dto, user);
  }

  @Get('risk-scales/case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener análisis de escalas de riesgo de un caso (lectura)' })
  async getRiskScales(@Param('caseId') caseId: string) {
    return this.psychologicalToolsService.findRiskScalesByCaseId(caseId);
  }

  @Get('clinical-translations/case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener traducciones clínicas de un caso (lectura)' })
  async getClinicalTranslations(@Param('caseId') caseId: string) {
    return this.psychologicalToolsService.findClinicalTranslationsByCaseId(caseId);
  }

  @Get('trauma/case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener análisis de trauma de un caso (lectura)' })
  async getTraumaAnalyses(@Param('caseId') caseId: string) {
    return this.psychologicalToolsService.findTraumaAnalysesByCaseId(caseId);
  }
}
