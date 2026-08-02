import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentType, AppointmentStatus } from '@defensoria/shared';

export interface CreateAppointmentDto {
  caseId: string;
  title: string;
  description?: string;
  appointmentType: AppointmentType;
  scheduledAt: string;
  endAt?: string;
  location?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto, userId: string) {
    const existingCase = await this.prisma.case.findUnique({ where: { id: dto.caseId } });
    if (!existingCase) {
      throw new NotFoundException('Expediente no encontrado');
    }

    return this.prisma.appointment.create({
      data: {
        caseId: dto.caseId,
        title: dto.title,
        description: dto.description || null,
        appointmentType: dto.appointmentType || AppointmentType.ENTREVISTA,
        scheduledAt: new Date(dto.scheduledAt),
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        location: dto.location || null,
        status: AppointmentStatus.PROGRAMADA,
        createdBy: userId,
      },
    });
  }

  async findByCase(caseId: string) {
    return this.prisma.appointment.findMany({
      where: { caseId },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findAll(officeId?: string, userId?: string, onlyMine?: boolean) {
    const whereClause: any = {};

    if (officeId && officeId !== 'ALL') {
      whereClause.case = { currentOfficeId: officeId };
    }

    if (userId && onlyMine) {
      whereClause.OR = [
        { createdBy: userId },
        { case: { teamHistory: { some: { userId, endDate: null } } } },
      ];
    }

    return this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        case: {
          select: {
            id: true,
            caseCode: true,
            currentPhase: true,
            riskLevel: true,
            currentOffice: {
              select: { id: true, name: true, code: true },
            },
            parties: {
              where: { isPrimary: true },
              include: { person: true },
            },
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            office: { select: { id: true, name: true, code: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async updateStatus(appointmentId: string, newStatus: any, reason?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Validar transiciones de estado permitidas
    const validTransitions: Record<any, any[]> = {
      PROGRAMADA: ['CONFIRMADA', 'CANCELADA'],
      CONFIRMADA: ['COMPLETADA', 'REPROGRAMADA', 'CANCELADA', 'NO_ASISTIO'],
      COMPLETADA: [],
      CANCELADA: [],
      REPROGRAMADA: ['CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO'],
      NO_ASISTIO: [],
    };

    if (!validTransitions[appointment.status]?.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar de estado ${appointment.status} a ${newStatus}`
      );
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      include: {
        case: { select: { id: true, caseCode: true } },
        creator: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });
  }

  async reassign(appointmentId: string, targetUserId: string, reason: string | undefined, currentUserId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { case: true, creator: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Citación con ID ${appointmentId} no encontrada`);
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException(`Usuario profesional destino no encontrado`);
    }

    // 1. Update appointment createdBy / assigned professional
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        createdBy: targetUserId,
      },
    });

    // 2. Assign target user to case team (enables RLS access & case representation)
    if (appointment.caseId) {
      await this.prisma.caseTeamHistory.create({
        data: {
          caseId: appointment.caseId,
          userId: targetUserId,
          role: targetUser.role,
          reason: reason || `Reasignación de citación "${appointment.title}"`,
          assignedBy: currentUserId,
        },
      });

      // 3. Register ActionLog entry on the case
      await this.prisma.actionLog.create({
        data: {
          caseId: appointment.caseId,
          authorId: currentUserId,
          actionType: 'DERIVACION',
          title: 'Reasignación de Citación y Representación',
          content: `Citación "${appointment.title}" y acceso al expediente reasignados al profesional ${targetUser.firstName} ${targetUser.lastName} (${targetUser.role}). Motivo: ${reason || 'Representación y cobertura operativa'}.`,
          isSigned: true,
          signedAt: new Date(),
        },
      });
    }

    return updatedAppointment;
  }
}
