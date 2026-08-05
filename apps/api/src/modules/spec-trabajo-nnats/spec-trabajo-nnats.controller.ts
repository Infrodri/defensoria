import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SpecTrabajoNNATSService } from './spec-trabajo-nnats.service';
import { CreateSpecTrabajoNNATSDto } from './dto/create-spec-trabajo-nnats.dto';
import { UpdateSpecTrabajoNNATSDto } from './dto/update-spec-trabajo-nnats.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessUser } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';

@ApiTags('SpecTrabajoNNATS')
@Controller('spec-trabajo-nnats')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SpecTrabajoNNATSController {
  constructor(private readonly service: SpecTrabajoNNATSService) {}

  @Post(':caseId')
  @Roles(Role.SOCIAL, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear formulario de trabajo infantil NNATS (máx. 40h semanales por normativa)' })
  async create(
    @Param('caseId') caseId: string,
    @Body() dto: CreateSpecTrabajoNNATSDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.create(caseId, dto, user);
  }

  @Get('case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener formulario NNATS por caso' })
  async findByCase(@Param('caseId') caseId: string) {
    return this.service.findByCaseId(caseId);
  }

  @Patch(':caseId')
  @Roles(Role.SOCIAL, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar formulario NNATS por caso' })
  async update(
    @Param('caseId') caseId: string,
    @Body() dto: UpdateSpecTrabajoNNATSDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.updateByCaseId(caseId, dto, user);
  }
}
