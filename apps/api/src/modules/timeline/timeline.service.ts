import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TimelineEvent {
  id: string;
  type: 'CASE_OPENED' | 'ACTION_LOG' | 'APPOINTMENT' | 'REPORT' | 'EVIDENCE';
  title: string;
  description: string;
  date: Date;
  metadata?: any;
  user?: { firstName: string; lastName: string; role: string };
}

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async getCaseTimeline(caseId: string): Promise<TimelineEvent[]> {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        actionLogs: { include: { author: true } },
        appointments: { include: { creator: true } },
        reports: { include: { author: true, disciplineReportType: { select: { category: true, name: true } } } },
        evidences: { include: { uploader: true } },
      }
    });

    if (!caseData) {
      throw new NotFoundException('Expediente no encontrado');
    }

    const events: TimelineEvent[] = [];

    // 1. Case Opened
    events.push({
      id: `case_open_${caseData.id}`,
      type: 'CASE_OPENED',
      title: 'Apertura de Expediente',
      description: `Se registró el caso con código ${caseData.caseCode} bajo la vía de intervención ${caseData.currentInterventionPath}.`,
      date: caseData.createdAt,
    });

    // 2. Action Logs (Bitácora)
    caseData.actionLogs.forEach(log => {
      events.push({
        id: `log_${log.id}`,
        type: 'ACTION_LOG',
        title: log.title,
        description: log.content,
        date: log.createdAt,
        metadata: { actionType: log.actionType, isSigned: log.isSigned },
        user: log.author ? { firstName: log.author.firstName, lastName: log.author.lastName, role: log.author.role } : undefined,
      });
    });

    // 3. Appointments
    caseData.appointments.forEach(app => {
      events.push({
        id: `app_${app.id}`,
        type: 'APPOINTMENT',
        title: `Cita Programada: ${app.title}`,
        description: app.description || `Tipo: ${app.appointmentType}. Lugar: ${app.location || 'N/A'}.`,
        date: app.createdAt,
        metadata: { scheduledAt: app.scheduledAt, status: app.status },
        user: app.creator ? { firstName: app.creator.firstName, lastName: app.creator.lastName, role: app.creator.role } : undefined,
      });
    });

    // 4. Reports (Informes Profesionales)
    caseData.reports.forEach(report => {
      events.push({
        id: `rep_${report.id}`,
        type: 'REPORT',
        title: `Informe ${report.status === 'EMITIDO' ? 'Emitido' : 'Borrador'}: ${report.title}`,
        description: `Tipo: ${report.disciplineReportType?.category ?? report.disciplineReportType?.name ?? 'Informe'} (v${report.version})`,
        date: report.status === 'EMITIDO' ? (report.emittedAt || report.updatedAt) : report.createdAt,
        metadata: { status: report.status, riskAssessment: report.riskAssessment },
        user: report.author ? { firstName: report.author.firstName, lastName: report.author.lastName, role: report.author.role } : undefined,
      });
    });

    // 5. Evidences
    caseData.evidences.forEach(ev => {
      events.push({
        id: `ev_${ev.id}`,
        type: 'EVIDENCE',
        title: 'Evidencia Adjuntada',
        description: ev.description || ev.fileName,
        date: ev.createdAt,
        metadata: { mimeType: ev.mimeType, isSensitive: ev.isSensitive, size: ev.fileSize },
        user: ev.uploader ? { firstName: ev.uploader.firstName, lastName: ev.uploader.lastName, role: ev.uploader.role } : undefined,
      });
    });

    // Sort all events by date (newest first)
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
