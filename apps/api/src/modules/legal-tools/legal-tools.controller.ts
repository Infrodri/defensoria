import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LegalToolsService } from './legal-tools.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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

  @Post('discrepancies/analyze')
  @Roles(Role.ABOGADO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Analizar discrepancias entre testimonios' })
  async analyzeDiscrepancies(
    @Body() dto: AnalyzeDiscrepanciesDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.legalToolsService.analyzeDiscrepancies(dto, userId);
  }

  @Post('typicality/analyze')
  @Roles(Role.ABOGADO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Analizar tipicidad penal del relato' })
  async analyzeTypicality(
    @Body() dto: AnalyzeTypicalityDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.legalToolsService.analyzeTypicality(dto, userId);
  }

  @Post('deadlines/calculate')
  @Roles(Role.ABOGADO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Calcular vencimientos procesales' })
  async calculateDeadlines(
    @Body() dto: CalculateDeadlineDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.legalToolsService.calculateDeadlines(dto, userId);
  }
}
