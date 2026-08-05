import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SpecViolenceDigitalService } from './spec-violence-digital.service';
import { CreateSpecViolenceDigitalDto } from './dto/create-spec-violence-digital.dto';
import { UpdateSpecViolenceDigitalDto } from './dto/update-spec-violence-digital.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessUser } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';

@ApiTags('SpecViolenceDigital')
@Controller('spec-violence-digital')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SpecViolenceDigitalController {
  constructor(private readonly service: SpecViolenceDigitalService) {}

  @Post(':caseId')
  @Roles(Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear registro de violencia digital para un caso' })
  async create(
    @Param('caseId') caseId: string,
    @Body() dto: CreateSpecViolenceDigitalDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.create(caseId, dto, user);
  }

  @Get('case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener registro de violencia digital por caso' })
  async findByCase(@Param('caseId') caseId: string) {
    return this.service.findByCaseId(caseId);
  }

  @Get(':caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener registro de violencia digital por caseId' })
  async getByCaseId(@Param('caseId') caseId: string) {
    return this.service.findByCaseId(caseId);
  }

  @Patch(':caseId')
  @Roles(Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar registro de violencia digital por caso' })
  async update(
    @Param('caseId') caseId: string,
    @Body() dto: UpdateSpecViolenceDigitalDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.updateByCaseId(caseId, dto, user);
  }
}
