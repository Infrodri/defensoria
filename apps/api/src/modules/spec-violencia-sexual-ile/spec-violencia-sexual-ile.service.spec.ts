import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SpecViolenciaSexualILEService } from './spec-violencia-sexual-ile.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

const user = { id: 'user-1', role: 'SOCIAL', officeId: null };

describe('SpecViolenciaSexualILEService', () => {
  let service: SpecViolenciaSexualILEService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;

  beforeEach(async () => {
    const prismaMock = {
      specViolenciaSexualILE: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'ile-1', caseId: 'case-1' }),
        update: vi.fn().mockResolvedValue({ id: 'ile-1', caseId: 'case-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecViolenciaSexualILEService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CaseAccessService, useValue: { assertUserHasAccess: vi.fn() } },
      ],
    }).compile();

    service = module.get<SpecViolenciaSexualILEService>(SpecViolenciaSexualILEService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debería crear el registro con delitoCalificado y las banderas del ILE', async () => {
    const dto = {
      delitoCalificado: 'VIOLACION_NNA',
      atendidoDentro24h: true,
      solicitoCamaraGesell: true,
    };

    const result = await service.create('case-1', dto as any, user as any);

    expect(caseAccess.assertUserHasAccess).toHaveBeenCalledWith('case-1', user);
    expect(prisma.specViolenciaSexualILE.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        caseId: 'case-1',
        delitoCalificado: 'VIOLACION_NNA',
        atendidoDentro24h: true,
        solicitoCamaraGesell: true,
      }),
    });
    expect(result.id).toBe('ile-1');
  });

  it('debería rechazar si ya existe un registro para el caso', async () => {
    vi.mocked(prisma.specViolenciaSexualILE.findUnique).mockResolvedValue({ id: 'ile-1' } as any);

    await expect(service.create('case-1', {} as any, user as any)).rejects.toThrow(BadRequestException);
  });

  it('debería rechazar sin acceso al caso', async () => {
    vi.mocked(caseAccess.assertUserHasAccess).mockRejectedValue(new ForbiddenException('denied'));

    await expect(service.create('case-1', {} as any, user as any)).rejects.toThrow(ForbiddenException);
  });
});
