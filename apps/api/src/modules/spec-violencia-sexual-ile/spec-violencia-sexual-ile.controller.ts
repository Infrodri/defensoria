import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SpecViolenciaSexualILEService } from './spec-violencia-sexual-ile.service';
import { CreateSpecViolenciaSexualILEDto } from './dto/create-spec-violencia-sexual-ile.dto';
import { UpdateSpecViolenciaSexualILEDto } from './dto/update-spec-violencia-sexual-ile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessUser } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';

@ApiTags('SpecViolenciaSexualILE')
@Controller('spec-violencia-sexual-ile')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SpecViolenciaSexualILEController {
  constructor(private readonly service: SpecViolenciaSexualILEService) {}

  @Post(':caseId')
  @Roles(Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear registro de violencia sexual ILE para un caso' })
  async create(
    @Param('caseId') caseId: string,
    @Body() dto: CreateSpecViolenciaSexualILEDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.create(caseId, dto, user);
  }

  @Get('case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener registro ILE por caso' })
  async findByCase(@Param('caseId') caseId: string) {
    return this.service.findByCaseId(caseId);
  }

  @Patch(':caseId')
  @Roles(Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar registro ILE por caso' })
  async update(
    @Param('caseId') caseId: string,
    @Body() dto: UpdateSpecViolenciaSexualILEDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.updateByCaseId(caseId, dto, user);
  }
}
