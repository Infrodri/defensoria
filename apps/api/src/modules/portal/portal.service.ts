import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortalService {
  constructor(private prisma: PrismaService) {}

  async getPortalStatus(caseId: string) {
    const caseItem = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        currentOffice: true,
      },
    });

    if (!caseItem) {
      throw new NotFoundException('Expediente no encontrado');
    }

    return {
      caseCode: caseItem.caseCode,
      currentPhase: caseItem.currentPhase,
      currentInterventionPath: caseItem.currentInterventionPath,
      currentOffice: {
        name: caseItem.currentOffice.name,
        address: caseItem.currentOffice.address,
        phone: caseItem.currentOffice.phone,
      },
      createdAt: caseItem.createdAt,
      isClosed: caseItem.isClosed,
    };
  }

  async getPortalAppointments(caseId: string) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        caseId,
        status: { in: ['PROGRAMADA', 'REPROGRAMADA'] },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return appointments.map(app => ({
      id: app.id,
      title: app.title,
      appointmentType: app.appointmentType,
      scheduledAt: app.scheduledAt,
      location: app.location,
      status: app.status,
    }));
  }
}
