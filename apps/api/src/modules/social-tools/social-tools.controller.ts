import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialToolsService } from './social-tools.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessUser } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';
import { GenerateFamilyMapDto } from './dto/generate-family-map.dto';
import { CalculateVulnerabilityDto } from './dto/calculate-vulnerability.dto';
import { MapEnvironmentalDto } from './dto/map-environmental.dto';

@ApiTags('Social Tools')
@Controller('social-tools')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SocialToolsController {
  constructor(private readonly socialToolsService: SocialToolsService) {}

  @Post('familymap/generate')
  @Roles(Role.SOCIAL, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Generar familiograma a partir de testimonios' })
  async generateFamilyMap(
    @Body() dto: GenerateFamilyMapDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.socialToolsService.generateFamilyMap(dto, user);
  }

  @Post('vulnerability/calculate')
  @Roles(Role.SOCIAL, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Calcular índice de vulnerabilidad social' })
  async calculateVulnerability(
    @Body() dto: CalculateVulnerabilityDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.socialToolsService.calculateVulnerability(dto, user);
  }

  @Post('environmental/map')
  @Roles(Role.SOCIAL, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Mapear factores de riesgo ambiental' })
  async mapEnvironmental(
    @Body() dto: MapEnvironmentalDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.socialToolsService.mapEnvironmental(dto, user);
  }

  @Get('environmental/case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener mapeo ambiental de un caso (lectura)' })
  async getEnvironmental(@Param('caseId') caseId: string) {
    return this.socialToolsService.findEnvironmentalByCaseId(caseId);
  }
}
