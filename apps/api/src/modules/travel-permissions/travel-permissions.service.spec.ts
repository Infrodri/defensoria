import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TravelPermissionsService, generateAuthorizationCode } from './travel-permissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TravelType, TravelCompanionType } from '@prisma/client';

const user = { id: 'user-1', role: 'ABOGADO', officeId: null };

describe('TravelPermissionsService', () => {
  let service: TravelPermissionsService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;

  beforeEach(async () => {
    const prismaMock = {
      travelPermission: {
        count: vi.fn().mockResolvedValue(3),
        findUnique: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 'travel-1', authorizationCode: 'TV-2026-0004' }),
        update: vi.fn().mockResolvedValue({ id: 'travel-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelPermissionsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CaseAccessService, useValue: { assertUserHasAccess: vi.fn() } },
      ],
    }).compile();

    service = module.get<TravelPermissionsService>(TravelPermissionsService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAuthorizationCode (formato TV-YYYY-NNNN)', () => {
    it('debería formatear el número secuencial con 4 dígitos', () => {
      expect(generateAuthorizationCode(1, 2026)).toBe('TV-2026-0001');
      expect(generateAuthorizationCode(12, 2026)).toBe('TV-2026-0012');
      expect(generateAuthorizationCode(1234, 2026)).toBe('TV-2026-1234');
    });
  });

  it('debería crear el permiso validando fecha futura y generando el código de autorización', async () => {
    const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const dto = {
      caseId: 'case-1',
      travelType: TravelType.INTERNACIONAL,
      companionType: TravelCompanionType.AMBOS_PADRES,
      destinationCity: 'Buenos Aires',
      departureDate: future,
    };

    const result = await service.create(dto as any, user as any);

    expect(caseAccess.assertUserHasAccess).toHaveBeenCalledWith('case-1', user);
    expect(prisma.travelPermission.count).toHaveBeenCalledWith({
      where: { authorizationCode: { startsWith: `TV-${new Date().getFullYear()}-` } },
    });
    expect(prisma.travelPermission.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        caseId: 'case-1',
        travelType: TravelType.INTERNACIONAL,
        authorizationCode: `TV-${new Date().getFullYear()}-0004`,
      }),
    });
    expect(result.id).toBe('travel-1');
  });

  it('debería usar el authorizationCode provisto si viene en el DTO', async () => {
    const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const dto = {
      caseId: 'case-1',
      travelType: TravelType.NACIONAL,
      companionType: TravelCompanionType.MADRE_SOLA,
      destinationCity: 'Cochabamba',
      departureDate: future,
      authorizationCode: 'TV-2026-0099',
    };

    await service.create(dto as any, user as any);

    expect(prisma.travelPermission.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ authorizationCode: 'TV-2026-0099' }),
    });
    expect(prisma.travelPermission.count).not.toHaveBeenCalled();
  });

  it('debería rechazar una fecha de salida en el pasado', async () => {
    const past = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const dto = {
      caseId: 'case-1',
      travelType: TravelType.NACIONAL,
      companionType: TravelCompanionType.SOLO,
      destinationCity: 'La Paz',
      departureDate: past,
    };

    await expect(service.create(dto as any, user as any)).rejects.toThrow(BadRequestException);
    expect(prisma.travelPermission.create).not.toHaveBeenCalled();
  });

  it('debería rechazar la creación sin caseId si el rol no es de alcance global', async () => {
    const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const fieldUser = { id: 'user-1', role: 'PSICOLOGO', officeId: null };
    const dto = {
      travelType: TravelType.NACIONAL,
      companionType: TravelCompanionType.SOLO,
      destinationCity: 'Santa Cruz',
      departureDate: future,
    };

    await expect(service.create(dto as any, fieldUser as any)).rejects.toThrow(ForbiddenException);
  });

  it('debería actualizar por id validando acceso al caso del registro', async () => {
    vi.mocked(prisma.travelPermission.findUnique).mockResolvedValue({
      id: 'travel-1',
      caseId: 'case-1',
    } as any);

    const result = await service.update('travel-1', { isIssued: true, issuedAt: new Date().toISOString() } as any, user as any);

    expect(caseAccess.assertUserHasAccess).toHaveBeenCalledWith('case-1', user);
    expect(prisma.travelPermission.update).toHaveBeenCalledWith({
      where: { id: 'travel-1' },
      data: expect.objectContaining({ isIssued: true }),
    });
    expect(result.id).toBe('travel-1');
  });

  it('debería lanzar NotFoundException si el permiso no existe', async () => {
    vi.mocked(prisma.travelPermission.findUnique).mockResolvedValue(null);

    await expect(service.update('travel-ghost', {} as any, user as any)).rejects.toThrow(NotFoundException);
  });
});
