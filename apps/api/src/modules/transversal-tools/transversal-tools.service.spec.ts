import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { TransversalToolsService } from './transversal-tools.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('TransversalToolsService', () => {
  let service: TransversalToolsService;
  let prisma: PrismaService;
  let audit: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransversalToolsService,
        {
          provide: PrismaService,
          useValue: {
            case: { findUnique: vi.fn() },
            report: { findUnique: vi.fn() },
             transversalUnifiedTimeline: { create: vi.fn(), findMany: vi.fn() },
             transversalAnonymizedReport: { create: vi.fn(), findMany: vi.fn() },
          },
        },
        {
          provide: AuditService,
          useValue: {
            logEvent: vi.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<TransversalToolsService>(TransversalToolsService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
  });

  describe('createUnifiedTimeline', () => {
    it('should create a unified timeline from case events', async () => {
      const mockCase = {
        id: 'case-123',
        actionLogs: [
          { createdAt: new Date('2026-08-01'), title: 'Nota 1', content: 'Detalle' },
        ],
        appointments: [
          { scheduledAt: new Date('2026-08-02'), title: 'Audiencia', description: 'Lugar' },
        ],
        processualDeadlines: [
          { calculatedDate: new Date('2026-08-05'), milestone: 'Plazo 1', status: 'EN_TIEMPO' },
        ],
      };

      vi.spyOn(prisma.case, 'findUnique').mockResolvedValue(mockCase as any);
      vi.spyOn((prisma as any).transversalUnifiedTimeline, 'create').mockResolvedValue({
        id: 'timeline-123',
        caseId: 'case-123',
        events: [],
        createdBy: 'user-123',
      } as any);

      const result = await service.createUnifiedTimeline('case-123', 'user-123');

      expect(result).toBeDefined();
      expect((prisma as any).transversalUnifiedTimeline.create).toHaveBeenCalled();
      expect(audit.logEvent).toHaveBeenCalled();
    });
  });

  describe('anonymizeReport', () => {
    it('should replace sensitive data with anonymized placeholders', async () => {
      const mockCase = {
        id: 'case-123',
        parties: [
          {
            roleInCase: 'NNA',
            person: { firstName: 'Juan', lastName: 'Pérez', documentNumber: '1234567', address: 'Av. Junín 10' },
          },
        ],
      };

      const mockReport = {
        id: 'report-123',
        caseId: 'case-123',
        content: 'El menor Juan Pérez con CI 1234567 vive en Av. Junín 10.',
      };

      vi.spyOn(prisma.case, 'findUnique').mockResolvedValue(mockCase as any);
      vi.spyOn(prisma.report, 'findUnique').mockResolvedValue(mockReport as any);
      vi.spyOn((prisma as any).transversalAnonymizedReport, 'create').mockImplementation((args: any) =>
        Promise.resolve({ id: 'anon-123', ...args.data } as any),
      );

      const result = await service.anonymizeReport('case-123', 'report-123', 'user-123');

       expect(result).toBeDefined();
       expect(result.anonymizedContent).toContain('[VÍCTIMA_1]');
       expect(result.anonymizedContent).toContain('[ID_567]');
       expect(result.anonymizedContent).toContain('[UBICACIÓN]');
       expect(audit.logEvent).toHaveBeenCalled();
     });
   });

   describe('findTimelineByCaseId (Fase 1)', () => {
     it('should return unified timelines for a case', async () => {
       const mockTimelines = [
         { id: 'tl-1', caseId: 'case-123', events: [] },
       ];
       vi.spyOn((prisma as any).transversalUnifiedTimeline, 'findMany').mockResolvedValue(mockTimelines as any);

       const result = await service.findTimelineByCaseId('case-123');

       expect((prisma as any).transversalUnifiedTimeline.findMany).toHaveBeenCalledWith({
         where: { caseId: 'case-123' },
         orderBy: { createdAt: 'desc' },
       });
       expect(result).toHaveLength(1);
     });
   });

   describe('findAnonymizedByCaseId (Fase 1)', () => {
     it('should return anonymized reports for a case', async () => {
       const mockReports = [
         { id: 'anon-1', caseId: 'case-123', anonymizedContent: 'Contenido anonimizado' },
       ];
       vi.spyOn((prisma as any).transversalAnonymizedReport, 'findMany').mockResolvedValue(mockReports as any);

       const result = await service.findAnonymizedByCaseId('case-123');

       expect((prisma as any).transversalAnonymizedReport.findMany).toHaveBeenCalledWith({
         where: { caseId: 'case-123' },
         orderBy: { createdAt: 'desc' },
       });
       expect(result).toHaveLength(1);
     });
   });
});
