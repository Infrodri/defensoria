import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TravelPermissionsService } from './travel-permissions.service';
import { CreateTravelPermissionDto } from './dto/create-travel-permission.dto';
import { UpdateTravelPermissionDto } from './dto/update-travel-permission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CaseAccessGuard } from '../../common/case-access/case-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessUser } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';

@ApiTags('TravelPermissions')
@Controller('travel-permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TravelPermissionsController {
  constructor(private readonly service: TravelPermissionsService) {}

  @Post()
  @Roles(Role.ABOGADO, Role.SOCIAL, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear permiso de viaje (caseId opcional)' })
  async create(@Body() dto: CreateTravelPermissionDto, @CurrentUser() user: AccessUser) {
    return this.service.create(dto, user);
  }

  @Get('case/:caseId')
  @UseGuards(CaseAccessGuard)
  @ApiOperation({ summary: 'Obtener permiso de viaje por caso' })
  async findByCase(@Param('caseId') caseId: string) {
    return this.service.findByCaseId(caseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener permiso de viaje por id' })
  async findById(@Param('id') id: string, @CurrentUser() user: AccessUser) {
    return this.service.findById(id, user);
  }

  @Patch(':id')
  @Roles(Role.ABOGADO, Role.SOCIAL, Role.JEFATURA, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar permiso de viaje (emisión, datos de acompañante, etc.)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelPermissionDto,
    @CurrentUser() user: AccessUser,
  ) {
    return this.service.update(id, dto, user);
  }
}
