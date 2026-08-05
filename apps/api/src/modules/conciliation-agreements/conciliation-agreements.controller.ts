import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConciliationAgreementsService } from './conciliation-agreements.service';
import { CreateConciliationAgreementDto } from './dto/create-conciliation-agreement.dto';
import { UpdateConciliationAgreementDto } from './dto/update-conciliation-agreement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessUser } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';

@ApiTags('ConciliationAgreements')
@Controller('conciliation-agreements')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConciliationAgreementsController {
  constructor(private readonly service: ConciliationAgreementsService) {}

  @Post(':caseId')
  @Roles(Role.ABOGADO, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear acuerdo de conciliación (1:1 con el caso)' })
  async create(
    @Param('caseId') caseId: string,
    @Body() dto: CreateConciliationAgreementDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.create(caseId, dto, user);
  }

  @Get('case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener acuerdo de conciliación por caso' })
  async findByCase(@Param('caseId') caseId: string) {
    return this.service.findByCaseId(caseId);
  }

  @Patch(':caseId')
  @Roles(Role.ABOGADO, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar acuerdo de conciliación por caso' })
  async update(
    @Param('caseId') caseId: string,
    @Body() dto: UpdateConciliationAgreementDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.updateByCaseId(caseId, dto, user);
  }
}
