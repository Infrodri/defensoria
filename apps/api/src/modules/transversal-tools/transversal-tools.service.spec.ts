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
            transversalUnifiedTimeline: { create: vi.fn() },
            transversalAnonymizedReport: { create: vi.fn() },
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
      vi.spyOn(prisma.transversalUnifiedTimeline, 'create').mockResolvedValue({
        id: 'timeline-123',
        caseId: 'case-123',
        events: [],
        createdBy: 'user-123',
      } as any);

      const result = await service.createUnifiedTimeline('case-123', 'user-123');

      expect(result).toBeDefined();
      expect(prisma.transversalUnifiedTimeline.create).toHaveBeenCalled();
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
      vi.spyOn(prisma.transversalAnonymizedReport, 'create').mockImplementation((args: any) =>
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
});
