import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Agenda centralizada o personal de citaciones' })
  async findAll(
    @Query('officeId') officeId?: string,
    @Query('onlyMine') onlyMine?: string,
    @Query('professionalId') professionalId?: string,
    @Query('specialtyRole') specialtyRole?: string,
    @Query('date') date?: string,
    @CurrentUser('id') userId?: string,
    @CurrentUser() user?: any,
  ) {
    return this.appointmentsService.findAll(officeId, userId, onlyMine === 'true', professionalId, specialtyRole, date, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de cita (CONFIRMADA, COMPLETADA, CANCELADA, etc)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.appointmentsService.updateStatus(id, body.status as any, body.reason);
  }

  @Patch(':id/respond')
  @ApiOperation({
    summary: 'Profesional responde a una propuesta de cita: ACCEPTED, MODIFIED o REJECTED',
    description:
      'Solo el profesional asignado puede responder. ' +
      'ACCEPTED confirma tal cual. MODIFIED cambia fecha/título/lugar. REJECTED cancela la propuesta.',
  })
  async respond(
    @Param('id') id: string,
    @Body() body: {
      response: 'ACCEPTED' | 'MODIFIED' | 'REJECTED';
      scheduledAt?: string;
      title?: string;
      location?: string;
      notes?: string;
    },
    @CurrentUser('id') userId: string,
  ) {
    return this.appointmentsService.respond(id, userId, body.response, {
      scheduledAt: body.scheduledAt,
      title: body.title,
      location: body.location,
      notes: body.notes,
    });
  }

  @Patch(':id/reassign')
  @Post(':id/reassign')
  @ApiOperation({ summary: 'Reasignar citación y habilitar representación de expediente a un nuevo profesional' })
  async reassign(
    @Param('id') id: string,
    @Body() body: { targetUserId: string; reason?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.appointmentsService.reassign(id, body.targetUserId, body.reason, userId);
  }

  @Post('reassign-body')
  @ApiOperation({ summary: 'Reasignar citación con ID en body' })
  async reassignBody(
    @Body() body: { appointmentId: string; targetUserId: string; reason?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.appointmentsService.reassign(body.appointmentId, body.targetUserId, body.reason, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar o reasignar citación de expediente' })
  async update(
    @Param('id') id: string,
    @Body() body: { targetUserId?: string; reason?: string; title?: string; status?: string },
    @CurrentUser('id') userId: string,
  ) {
    if (body.targetUserId) {
      return this.appointmentsService.reassign(id, body.targetUserId, body.reason, userId);
    }
    return this.appointmentsService.reassign(id, userId, body.reason, userId);
  }
}
