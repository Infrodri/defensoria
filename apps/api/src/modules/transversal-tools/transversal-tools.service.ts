import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TransversalToolsService {
  private readonly logger = new Logger(TransversalToolsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createUnifiedTimeline(caseId: string, userId: string) {
    this.logger.log(`Creating unified timeline for case ${caseId} by user ${userId}`);

    // Validate case access
    const caseRecord = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        actionLogs: true,
        appointments: true,
        processualDeadlines: true,
      }
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    // Unify events
    const events: any[] = [];

    caseRecord.actionLogs.forEach(log => {
      events.push({
        type: 'ACTION_LOG',
        date: log.createdAt,
        title: log.title,
        description: log.content,
      });
    });

    caseRecord.appointments.forEach(app => {
      events.push({
        type: 'APPOINTMENT',
        date: app.scheduledAt,
        title: app.title,
        description: app.description,
      });
    });

    caseRecord.processualDeadlines.forEach(pd => {
      events.push({
        type: 'PROCESSUAL_DEADLINE',
        date: pd.calculatedDate,
        title: pd.milestone,
        description: `Deadline: ${pd.status}`,
      });
    });

    // Order by date ascending
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Save
    const timeline = await (this.prisma as any).transversalUnifiedTimeline.create({
      data: {
        caseId,
        events,
        createdBy: userId,
      }
    });
    
    // Log audit
    await this.audit.logEvent({
      userId,
      userRole: 'SISTEMA', // default fallback, normally we'd pass this or get from context
      action: 'CREATE',
      entityType: 'TransversalUnifiedTimeline',
      entityId: timeline.id,
      details: { caseId },
    });

    return timeline;
  }

  async anonymizeReport(caseId: string, reporteId: string, userId: string) {
    this.logger.log(`Anonymizing report ${reporteId} for case ${caseId} by user ${userId}`);

    const caseRecord = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        parties: {
          include: { person: true }
        }
      }
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    const report = await this.prisma.report.findUnique({
      where: { id: reporteId }
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.caseId !== caseId) {
      throw new ForbiddenException('Report does not belong to the case');
    }

    let anonymizedContent = report.content;
    const replacements: Record<string, string> = {};

    let victimCount = 1;
    let otherCount = 1;

    caseRecord.parties.forEach(party => {
      const person = party.person;
      const fullName = `${person.firstName} ${person.lastName}`;
      const docNum = person.documentNumber;
      
      let alias = `[PERSONA_${otherCount}]`;
      if (party.roleInCase === 'NNA') {
        alias = `[VÍCTIMA_${victimCount}]`;
        victimCount++;
      } else {
        otherCount++;
      }

      if (fullName) {
        replacements[fullName] = alias;
        const regex = new RegExp(this.escapeRegExp(fullName), 'gi');
        anonymizedContent = anonymizedContent.replace(regex, alias);
      }

      if (docNum) {
        const idAlias = `[ID_${docNum.substring(docNum.length - 3) || 'XXX'}]`;
        replacements[docNum] = idAlias;
        anonymizedContent = anonymizedContent.replace(new RegExp(this.escapeRegExp(docNum), 'g'), idAlias);
      }
      
      if (person.address) {
        replacements[person.address] = '[UBICACIÓN]';
        anonymizedContent = anonymizedContent.replace(new RegExp(this.escapeRegExp(person.address), 'gi'), '[UBICACIÓN]');
      }
    });

    const anonymizedReport = await (this.prisma as any).transversalAnonymizedReport.create({
      data: {
        caseId,
        originalReportId: reporteId,
        anonymizedContent,
        replacements,
        createdBy: userId,
      }
    });
    
    // Log exhaustivo para auditoría
    await this.audit.logEvent({
      userId,
      userRole: 'SISTEMA',
      action: 'ANONYMIZE',
      entityType: 'TransversalAnonymizedReport',
      entityId: anonymizedReport.id,
      details: { caseId, originalReportId: reporteId },
    });

    return anonymizedReport;
  }
  
  private escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
}
