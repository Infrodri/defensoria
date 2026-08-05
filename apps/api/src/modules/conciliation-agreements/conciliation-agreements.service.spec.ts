import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConciliationAgreementsService } from './conciliation-agreements.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

const user = { id: 'user-1', role: 'ABOGADO', officeId: null };

describe('ConciliationAgreementsService', () => {
  let service: ConciliationAgreementsService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;

  beforeEach(async () => {
    const prismaMock = {
      conciliationAgreement: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'agreement-1', caseId: 'case-1' }),
        update: vi.fn().mockResolvedValue({ id: 'agreement-1', caseId: 'case-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConciliationAgreementsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CaseAccessService, useValue: { assertUserHasAccess: vi.fn() } },
      ],
    }).compile();

    service = module.get<ConciliationAgreementsService>(ConciliationAgreementsService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debería crear el acuerdo con topic, monto y contenido', async () => {
    const dto = {
      topic: 'Régimen de visitas',
      agreedAmountBs: 500,
      agreementContent: 'El progenitor acuerda aportar Bs 500 mensuales',
      isSignedByParties: true,
    };

    const result = await service.create('case-1', dto as any, user as any);

    expect(caseAccess.assertUserHasAccess).toHaveBeenCalledWith('case-1', user);
    expect(prisma.conciliationAgreement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        caseId: 'case-1',
        topic: 'Régimen de visitas',
        agreedAmountBs: 500,
        agreementContent: 'El progenitor acuerda aportar Bs 500 mensuales',
        isSignedByParties: true,
      }),
    });
    expect(result.id).toBe('agreement-1');
  });

  it('debería rechazar si ya existe un acuerdo para el caso (relación 1:1)', async () => {
    vi.mocked(prisma.conciliationAgreement.findUnique).mockResolvedValue({ id: 'agreement-1' } as any);

    await expect(service.create('case-1', {} as any, user as any)).rejects.toThrow(BadRequestException);
  });

  it('debería rechazar sin acceso al caso', async () => {
    vi.mocked(caseAccess.assertUserHasAccess).mockRejectedValue(new ForbiddenException('denied'));

    await expect(service.create('case-1', {} as any, user as any)).rejects.toThrow(ForbiddenException);
  });
});
