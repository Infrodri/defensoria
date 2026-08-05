import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProtectionMeasuresService } from './protection-measures.service';
import { CreateProtectionMeasureDto } from './dto/create-protection-measure.dto';
import { UpdateProtectionMeasureDto } from './dto/update-protection-measure.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessUser } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';

@ApiTags('ProtectionMeasures')
@Controller('protection-measures')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProtectionMeasuresController {
  constructor(private readonly service: ProtectionMeasuresService) {}

  @Post(':caseId')
  @Roles(Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear medida de protección (incluye alerta 24h para ACOGIMIENTO_CIRCUNSTANCIAL)' })
  async create(
    @Param('caseId') caseId: string,
    @Body() dto: CreateProtectionMeasureDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.create(caseId, dto, user);
  }

  @Get('case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Listar medidas de protección de un caso' })
  async findByCase(@Param('caseId') caseId: string) {
    return this.service.findByCaseId(caseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener medida de protección por id' })
  async findById(@Param('id') id: string, @CurrentUser() user: AccessUser) {
    return this.service.findById(id, user);
  }

  @Patch(':id')
  @Roles(Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar medida de protección (re-evalúa el plazo legal de 24h)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProtectionMeasureDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.update(id, dto, user);
  }
}
