import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConciliationService } from './conciliation.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ConciliationService', () => {
  let service: ConciliationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      conciliationProcess: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'process-1',
          caseId: 'case-1',
          isCompleted: false,
        }),
        update: vi.fn().mockResolvedValue({ id: 'process-1', isCompleted: true }),
      },
      conciliationAgreement: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'agreement-1', caseId: 'case-1' }),
      },
      actionLog: { create: vi.fn() },
      case: { update: vi.fn() },
      interventionPathHistory: { create: vi.fn() },
      $transaction: vi.fn((cb) => cb(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConciliationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ConciliationService>(ConciliationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('recordResult — integración con ConciliationAgreement (GAP Fase 2)', () => {
    it('debería crear ConciliationAgreement cuando se alcanza acuerdo', async () => {
      await service.recordResult('process-1', { agreementReached: true, agreementText: 'Acuerdo de manutención' }, 'user-1');

      expect(prisma.conciliationAgreement.create).toHaveBeenCalledWith({
        data: {
          caseId: 'case-1',
          topic: 'Acuerdo de Conciliación',
          agreementContent: 'Acuerdo de manutención',
          isSignedByParties: false,
        },
      });
      expect(prisma.conciliationProcess.update).toHaveBeenCalledWith({
        where: { id: 'process-1' },
        data: expect.objectContaining({
          isCompleted: true,
          agreementReached: true,
          agreementText: 'Acuerdo de manutención',
        }),
      });
    });

    it('debería usar el topic provisto en el DTO para el acuerdo', async () => {
      await service.recordResult(
        'process-1',
        { agreementReached: true, agreementText: 'Acuerdo', topic: 'Régimen de visitas' },
        'user-1',
      );

      expect(prisma.conciliationAgreement.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ topic: 'Régimen de visitas' }) }),
      );
    });

    it('NO debería duplicar el acuerdo si ya existe para el caso', async () => {
      vi.mocked(prisma.conciliationAgreement.findUnique).mockResolvedValue({
        id: 'agreement-1',
        caseId: 'case-1',
      } as any);

      await service.recordResult('process-1', { agreementReached: true, agreementText: 'Acuerdo' }, 'user-1');

      expect(prisma.conciliationAgreement.create).not.toHaveBeenCalled();
    });

    it('NO debería crear acuerdo cuando NO se alcanza acuerdo (deriva a VIA_JUDICIAL)', async () => {
      await service.recordResult('process-1', { agreementReached: false }, 'user-1');

      expect(prisma.conciliationAgreement.create).not.toHaveBeenCalled();
      expect(prisma.case.update).toHaveBeenCalledWith({
        where: { id: 'case-1' },
        data: { currentInterventionPath: 'VIA_JUDICIAL' },
      });
      expect(prisma.interventionPathHistory.create).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el proceso no existe', async () => {
      vi.mocked(prisma.conciliationProcess.findUnique).mockResolvedValue(null);

      await expect(service.recordResult('process-ghost', { agreementReached: true }, 'user-1'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
