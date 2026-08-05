import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SpecViolenceDigitalService } from './spec-violence-digital.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DigitalPlatform } from '@prisma/client';

const user = { id: 'user-1', role: 'SOCIAL', officeId: null };

describe('SpecViolenceDigitalService', () => {
  let service: SpecViolenceDigitalService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;

  beforeEach(async () => {
    const prismaMock = {
      specViolenceDigital: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'svd-1', caseId: 'case-1' }),
        update: vi.fn().mockResolvedValue({ id: 'svd-1', caseId: 'case-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecViolenceDigitalService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CaseAccessService, useValue: { assertUserHasAccess: vi.fn() } },
      ],
    }).compile();

    service = module.get<SpecViolenceDigitalService>(SpecViolenceDigitalService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debería crear el registro validando acceso al caso y mapeando enums de plataforma', async () => {
    const dto = {
      urls: ['https://tiktok.com/@x/video/1'],
      platforms: [DigitalPlatform.TIKTOK],
      requiresForensic: true,
    };

    const result = await service.create('case-1', dto as any, user as any);

    expect(caseAccess.assertUserHasAccess).toHaveBeenCalledWith('case-1', user);
    expect(prisma.specViolenceDigital.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        caseId: 'case-1',
        urls: ['https://tiktok.com/@x/video/1'],
        platforms: [DigitalPlatform.TIKTOK],
        requiresForensic: true,
      }),
    });
    expect(result.id).toBe('svd-1');
  });

  it('debería rechazar la creación si ya existe un registro para el caso', async () => {
    vi.mocked(prisma.specViolenceDigital.findUnique).mockResolvedValue({ id: 'svd-1' } as any);

    await expect(service.create('case-1', {} as any, user as any)).rejects.toThrow(BadRequestException);
  });

  it('debería rechazar si el usuario no tiene acceso al caso', async () => {
    vi.mocked(caseAccess.assertUserHasAccess).mockRejectedValue(new ForbiddenException('denied'));

    await expect(service.create('case-1', {} as any, user as any)).rejects.toThrow(ForbiddenException);
  });

  it('debería retornar el registro por caseId', async () => {
    vi.mocked(prisma.specViolenceDigital.findUnique).mockResolvedValue({ id: 'svd-1', caseId: 'case-1' } as any);

    const result = await service.findByCaseId('case-1');

    expect(prisma.specViolenceDigital.findUnique).toHaveBeenCalledWith({ where: { caseId: 'case-1' } });
    expect(result.caseId).toBe('case-1');
  });

  it('debería actualizar por caseId validando acceso', async () => {
    vi.mocked(prisma.specViolenceDigital.findUnique).mockResolvedValue({ id: 'svd-1', caseId: 'case-1' } as any);

    const result = await service.updateByCaseId('case-1', { phoneOperator: 'Entel' } as any, user as any);

    expect(caseAccess.assertUserHasAccess).toHaveBeenCalledWith('case-1', user);
    expect(prisma.specViolenceDigital.update).toHaveBeenCalledWith({
      where: { caseId: 'case-1' },
      data: expect.objectContaining({ phoneOperator: 'Entel' }),
    });
    expect(result.id).toBe('svd-1');
  });
});
