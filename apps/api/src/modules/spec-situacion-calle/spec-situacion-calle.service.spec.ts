import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SpecSituacionCalleService } from './spec-situacion-calle.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { StreetPhase } from '@prisma/client';

const user = { id: 'user-1', role: 'SOCIAL', officeId: null };

describe('SpecSituacionCalleService', () => {
  let service: SpecSituacionCalleService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;

  beforeEach(async () => {
    const prismaMock = {
      specSituacionCalle: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'calle-1', caseId: 'case-1' }),
        update: vi.fn().mockResolvedValue({ id: 'calle-1', caseId: 'case-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecSituacionCalleService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CaseAccessService, useValue: { assertUserHasAccess: vi.fn() } },
      ],
    }).compile();

    service = module.get<SpecSituacionCalleService>(SpecSituacionCalleService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debería crear el registro con la fase actual y el historial de calle', async () => {
    const dto = {
      faseActual: StreetPhase.REHABILITACION,
      streetHistory: 'Vivió en la calle desde los 9 años',
      substanceAbuse: ['INHALANTES'],
      yearsOnStreet: 3.5,
    };

    const result = await service.create('case-1', dto as any, user as any);

    expect(caseAccess.assertUserHasAccess).toHaveBeenCalledWith('case-1', user);
    expect(prisma.specSituacionCalle.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        caseId: 'case-1',
        faseActual: StreetPhase.REHABILITACION,
        streetHistory: 'Vivió en la calle desde los 9 años',
        substanceAbuse: ['INHALANTES'],
        yearsOnStreet: 3.5,
      }),
    });
    expect(result.id).toBe('calle-1');
  });

  it('debería rechazar si ya existe un registro para el caso', async () => {
    vi.mocked(prisma.specSituacionCalle.findUnique).mockResolvedValue({ id: 'calle-1' } as any);

    await expect(service.create('case-1', {} as any, user as any)).rejects.toThrow(BadRequestException);
  });

  it('debería rechazar sin acceso al caso', async () => {
    vi.mocked(caseAccess.assertUserHasAccess).mockRejectedValue(new ForbiddenException('denied'));

    await expect(service.create('case-1', {} as any, user as any)).rejects.toThrow(ForbiddenException);
  });

  it('debería actualizar por caseId validando acceso', async () => {
    vi.mocked(prisma.specSituacionCalle.findUnique).mockResolvedValue({ id: 'calle-1', caseId: 'case-1' } as any);

    const result = await service.updateByCaseId('case-1', { notificadoITD: true } as any, user as any);

    expect(caseAccess.assertUserHasAccess).toHaveBeenCalledWith('case-1', user);
    expect(prisma.specSituacionCalle.update).toHaveBeenCalledWith({
      where: { caseId: 'case-1' },
      data: expect.objectContaining({ notificadoITD: true }),
    });
    expect(result.id).toBe('calle-1');
  });
});
