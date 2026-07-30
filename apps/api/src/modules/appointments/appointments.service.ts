import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(officeId?: string) {
    return this.prisma.appointment.findMany({
      where: officeId
        ? {
            case: { currentOfficeId: officeId },
          }
        : {},
      include: {
        case: {
          select: {
            id: true,
            caseCode: true,
            currentPhase: true,
            parties: {
              include: { person: true },
            },
          },
        },
        creator: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 50,
    });
  }
}
