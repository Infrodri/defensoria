import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { SpecTrabajoNNATSService } from './spec-trabajo-nnats.service';
import { CreateSpecTrabajoNNATSDto } from './dto/create-spec-trabajo-nnats.dto';
import { UpdateSpecTrabajoNNATSDto } from './dto/update-spec-trabajo-nnats.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

const user = { id: 'user-1', role: 'SOCIAL', officeId: null };

describe('SpecTrabajoNNATSService', () => {
  let service: SpecTrabajoNNATSService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;

  beforeEach(async () => {
    const prismaMock = {
      specTrabajoNNATS: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'nnats-1', caseId: 'case-1' }),
        update: vi.fn().mockResolvedValue({ id: 'nnats-1', caseId: 'case-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecTrabajoNNATSService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CaseAccessService, useValue: { assertUserHasAccess: vi.fn() } },
      ],
    }).compile();

    service = module.get<SpecTrabajoNNATSService>(SpecTrabajoNNATSService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validación normativa de 40 horas semanales (DTO)', () => {
    it('debería rechazar hoursPerWeek mayor a 40 con el mensaje normativo', async () => {
      const dto = new CreateSpecTrabajoNNATSDto();
      dto.hoursPerWeek = 45;
      dto.salaryBs = 1000;

      const errors = await validate(dto);

      const hoursError = errors.find((e) => e.property === 'hoursPerWeek');
      expect(hoursError).toBeDefined();
      expect(Object.values(hoursError.constraints)).toContain('Máximo 40 horas semanales permitidas por normativa');
    });

    it('debería aceptar exactamente 40 horas semanales', async () => {
      const dto = new CreateSpecTrabajoNNATSDto();
      dto.hoursPerWeek = 40;
      dto.salaryBs = 1000;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'hoursPerWeek')).toBe(false);
    });

    it('el DTO de actualización también debería aplicar la regla de 40 horas', async () => {
      const dto = new UpdateSpecTrabajoNNATSDto();
      dto.hoursPerWeek = 50;

      const errors = await validate(dto);

      const hoursError = errors.find((e) => e.property === 'hoursPerWeek');
      expect(hoursError).toBeDefined();
      expect(Object.values(hoursError.constraints)).toContain('Máximo 40 horas semanales permitidas por normativa');
    });
  });

  it('debería crear el registro con los datos del formulario NNATS', async () => {
    const dto = {
      hoursPerWeek: 36,
      salaryBs: 850.5,
      risksIdentified: ['TRABAJO_PESADO'],
      isProhibitedWork: true,
    };

    const result = await service.create('case-1', dto as any, user as any);

    expect(caseAccess.assertUserHasAccess).toHaveBeenCalledWith('case-1', user);
    expect(prisma.specTrabajoNNATS.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        caseId: 'case-1',
        hoursPerWeek: 36,
        salaryBs: 850.5,
        risksIdentified: ['TRABAJO_PESADO'],
        isProhibitedWork: true,
      }),
    });
    expect(result.id).toBe('nnats-1');
  });

  it('debería rechazar si ya existe el formulario para el caso', async () => {
    vi.mocked(prisma.specTrabajoNNATS.findUnique).mockResolvedValue({ id: 'nnats-1' } as any);

    await expect(service.create('case-1', {} as any, user as any)).rejects.toThrow(BadRequestException);
  });

  it('debería rechazar sin acceso al caso', async () => {
    vi.mocked(caseAccess.assertUserHasAccess).mockRejectedValue(new ForbiddenException('denied'));

    await expect(service.create('case-1', {} as any, user as any)).rejects.toThrow(ForbiddenException);
  });
});
