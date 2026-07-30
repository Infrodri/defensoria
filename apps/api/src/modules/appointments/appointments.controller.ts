import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService, CreateAppointmentDto } from './appointments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Programar cita o audiencia vinculada a un expediente' })
  async create(@Body() dto: CreateAppointmentDto, @CurrentUser('id') userId: string) {
    return this.appointmentsService.create(dto, userId);
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Obtener historial de citas vinculadas a un expediente' })
  async findByCase(@Param('caseId') caseId: string) {
    return this.appointmentsService.findByCase(caseId);
  }

  @Get()
  @ApiOperation({ summary: 'Agenda centralizada (filtro opcional por oficina)' })
  async findAll(@Query('officeId') officeId?: string) {
    return this.appointmentsService.findAll(officeId);
  }
}
