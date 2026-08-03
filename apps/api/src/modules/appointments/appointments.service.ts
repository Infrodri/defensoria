import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentType, AppointmentStatus } from '@defensoria/shared';

export interface CreateAppointmentDto {
  caseId: string;
  title: string;
  description?: string;
  appointmentType: AppointmentType;
  scheduledAt?: string;          // opcional — profesional puede definirla después
  endAt?: string;
  location?: string;
  assignedProfessionalId?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto, userId: string) {
    const existingCase = await this.prisma.case.findUnique({ where: { id: dto.caseId } });
    if (!existingCase) {
      throw new NotFoundException('Expediente no encontrado');
    }

    // Resolver profesional asignado
    let assignedProfessionalId = dto.assignedProfessionalId || null;
    if (!assignedProfessionalId) {
      const firstTeamMember = await this.prisma.caseTeamHistory.findFirst({
        where: { caseId: dto.caseId, endDate: null },
        orderBy: { startDate: 'asc' },
        select: { userId: true },
      });
      assignedProfessionalId = firstTeamMember?.userId ?? null;
    }

    // Quién crea la cita determina el estado inicial:
    // - Secretaria/Jefatura → PROPUESTA (el profesional debe confirmar)
    // - El propio profesional asignado → PROGRAMADA (ya confirmada)
    const creator = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const isProfessionalSelf =
      assignedProfessionalId === userId &&
      ['ABOGADO', 'PSICOLOGO', 'SOCIAL'].includes(creator?.role ?? '');

    const initialStatus = isProfessionalSelf
      ? AppointmentStatus.PROGRAMADA
      : AppointmentStatus.PROPUESTA;

    return this.prisma.appointment.create({
      data: {
        caseId: dto.caseId,
        title: dto.title,
        description: dto.description || null,
        appointmentType: dto.appointmentType || AppointmentType.ENTREVISTA,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        location: dto.location || null,
        status: initialStatus,
        createdBy: userId,
        assignedProfessionalId,
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, role: true } },
        assignedProfessional: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });
  }

  // ── Respuesta del profesional a una propuesta de cita ──────────────────────
  async respond(
    appointmentId: string,
    professionalId: string,
    response: 'ACCEPTED' | 'MODIFIED' | 'REJECTED',
    opts?: {
      scheduledAt?: string;
      title?: string;
      location?: string;
      notes?: string;
    },
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        assignedProfessional: { select: { id: true, firstName: true, lastName: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Solo el profesional asignado puede responder
    if (appointment.assignedProfessionalId !== professionalId) {
      throw new BadRequestException(
        'Solo el profesional asignado puede responder a esta propuesta de cita.',
      );
    }

    // Solo citas en estado PROPUESTA o REPROGRAMADA pueden recibir respuesta
    if (!['PROPUESTA', 'REPROGRAMADA'].includes(appointment.status)) {
      throw new BadRequestException(
        `La cita ya fue ${appointment.status.toLowerCase()} y no puede recibir más respuestas.`,
      );
    }

    const newStatus =
      response === 'ACCEPTED' ? AppointmentStatus.PROGRAMADA :
      response === 'MODIFIED' ? AppointmentStatus.PROGRAMADA :
      AppointmentStatus.RECHAZADA;

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: newStatus,
        professionalResponse: response,
        professionalNotes: opts?.notes ?? null,
        respondedAt: new Date(),
        // Si modifica, aplicar los nuevos valores
        ...(response === 'MODIFIED' && {
          scheduledAt: opts?.scheduledAt ? new Date(opts.scheduledAt) : appointment.scheduledAt,
          title: opts?.title ?? appointment.title,
          location: opts?.location ?? appointment.location,
        }),
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, role: true } },
        assignedProfessional: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });

    // Registrar en ActionLog del caso para trazabilidad
    const profName = `${appointment.assignedProfessional?.firstName} ${appointment.assignedProfessional?.lastName}`;
    const responseLabel =
      response === 'ACCEPTED' ? 'aceptó' :
      response === 'MODIFIED' ? 'aceptó con modificaciones' :
      'rechazó';

    await this.prisma.actionLog.create({
      data: {
        caseId: appointment.caseId,
        authorId: professionalId,
        actionType: 'OTRO',
        title: `Cita ${responseLabel}: ${updated.title}`,
        content: [
          `El profesional ${profName} ${responseLabel} la cita "${appointment.title}".`,
          opts?.notes ? `Observaciones: ${opts.notes}` : '',
          response === 'MODIFIED' && opts?.scheduledAt
            ? `Nueva fecha propuesta: ${new Date(opts.scheduledAt).toLocaleString('es-BO')}`
            : '',
        ].filter(Boolean).join(' '),
        isSigned: true,
        signedAt: new Date(),
      },
    });

    return updated;
  }

  async findByCase(caseId: string) {
    return this.prisma.appointment.findMany({
      where: { caseId },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, role: true } },
        assignedProfessional: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findAll(officeId?: string, userId?: string, onlyMine?: boolean, professionalId?: string, specialtyRole?: string, date?: string, user?: any) {
    const whereClause: any = {};

    // Secretaria ve todas las citas de su oficina
    if (user?.role === 'SECRETARIA' && user?.officeId) {
      whereClause.case = { currentOfficeId: user.officeId };
    } else if (officeId && officeId !== 'ALL') {
      whereClause.case = { currentOfficeId: officeId };
    }

    // Filtrar por profesional específico — busca en assignedProfessionalId primero,
    // luego en createdBy para compatibilidad con citas antiguas
    if (professionalId) {
      whereClause.OR = [
        { assignedProfessionalId: professionalId },
        { createdBy: professionalId },
      ];
    }

    // Filtrar por especialidad/rol — usa la relación assignedProfessional
    if (specialtyRole) {
      whereClause.assignedProfessional = { role: specialtyRole };
    }

    // Filtrar por fecha específica
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      whereClause.scheduledAt = {
        gte: targetDate,
        lt: nextDay,
      };
    }

    if (userId && onlyMine) {
      whereClause.OR = [
        { assignedProfessionalId: userId },
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
        assignedProfessional: {
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
      PROPUESTA:    ['PROGRAMADA', 'RECHAZADA', 'CANCELADA'],
      PROGRAMADA:   ['CONFIRMADA', 'CANCELADA', 'REPROGRAMADA'],
      CONFIRMADA:   ['COMPLETADA', 'REPROGRAMADA', 'CANCELADA', 'NO_ASISTIO'],
      COMPLETADA:   [],
      CANCELADA:    [],
      REPROGRAMADA: ['PROGRAMADA', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO'],
      NO_ASISTIO:   [],
      RECHAZADA:    [],
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

    return this.prisma.$transaction(async (tx) => {
      // 1. Mover la cita al nuevo profesional: actualizar assignedProfessionalId
      //    (createdBy se mantiene como auditoría de quién la creó originalmente)
      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          assignedProfessionalId: targetUserId,
        },
      });

      // 2. Assign target user to case team (enables RLS access & case representation)
      if (appointment.caseId) {
        // FIX 1 (Fase 0): cerrar filas activas previas del mismo (caseId, role)
        // antes de crear la nueva — evita dos asignaciones activas duplicadas.
        await tx.caseTeamHistory.updateMany({
          where: {
            caseId: appointment.caseId,
            role: targetUser.role,
            endDate: null,
          },
          data: {
            endDate: new Date(),
          },
        });

        await tx.caseTeamHistory.create({
          data: {
            caseId: appointment.caseId,
            userId: targetUserId,
            role: targetUser.role,
            reason: reason || `Reasignación de citación "${appointment.title}"`,
            assignedBy: currentUserId,
          },
        });

        // 3. Register ActionLog entry on the case
        await tx.actionLog.create({
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
    });
  }
}
