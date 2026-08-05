import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SpecSituacionCalleService } from './spec-situacion-calle.service';
import { CreateSpecSituacionCalleDto } from './dto/create-spec-situacion-calle.dto';
import { UpdateSpecSituacionCalleDto } from './dto/update-spec-situacion-calle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessUser } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';

@ApiTags('SpecSituacionCalle')
@Controller('spec-situacion-calle')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SpecSituacionCalleController {
  constructor(private readonly service: SpecSituacionCalleService) {}

  @Post(':caseId')
  @Roles(Role.SOCIAL, Role.PSICOLOGO, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear registro de situación de calle para un caso' })
  async create(
    @Param('caseId') caseId: string,
    @Body() dto: CreateSpecSituacionCalleDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.create(caseId, dto, user);
  }

  @Get('case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener registro de situación de calle por caso' })
  async findByCase(@Param('caseId') caseId: string) {
    return this.service.findByCaseId(caseId);
  }

  @Patch(':caseId')
  @Roles(Role.SOCIAL, Role.PSICOLOGO, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar registro de situación de calle por caso' })
  async update(
    @Param('caseId') caseId: string,
    @Body() dto: UpdateSpecSituacionCalleDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.updateByCaseId(caseId, dto, user);
  }
}
