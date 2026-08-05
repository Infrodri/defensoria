import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ProtectionMeasuresService, evaluateLegalDeadline } from './protection-measures.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProtectionMeasureType } from '@prisma/client';

const user = { id: 'user-1', role: 'SOCIAL', officeId: null };

describe('ProtectionMeasuresService', () => {
  let service: ProtectionMeasuresService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;

  beforeEach(async () => {
    const prismaMock = {
      protectionMeasure: {
        findUnique: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 'pm-1', caseId: 'case-1' }),
        update: vi.fn().mockResolvedValue({ id: 'pm-1', caseId: 'case-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProtectionMeasuresService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CaseAccessService, useValue: { assertUserHasAccess: vi.fn() } },
      ],
    }).compile();

    service = module.get<ProtectionMeasuresService>(ProtectionMeasuresService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('evaluateLegalDeadline — alerta procesal ACOGIMIENTO_CIRCUNSTANCIAL (24h)', () => {
    const executedAt = new Date('2026-08-01T10:00:00Z');

    it('debería marcar fuera de plazo si no hay notificación judicial registrada', () => {
      const result = evaluateLegalDeadline(ProtectionMeasureType.ACOGIMIENTO_CIRCUNSTANCIAL, executedAt, null);

      expect(result.isWithinLegalDeadline).toBe(false);
      expect(result.alert).toBeDefined();
      expect(result.alert).toContain('24 horas');
    });

    it('debería estar dentro de plazo si la notificación ocurre dentro de las 24h', () => {
      const notifiedAt = new Date('2026-08-02T09:00:00Z'); // 23h después
      const result = evaluateLegalDeadline(ProtectionMeasureType.ACOGIMIENTO_CIRCUNSTANCIAL, executedAt, notifiedAt);

      expect(result.isWithinLegalDeadline).toBe(true);
      expect(result.alert).toBeUndefined();
    });

    it('debería marcar fuera de plazo si la notificación excede las 24h', () => {
      const notifiedAt = new Date('2026-08-02T11:00:00Z'); // 25h después
      const result = evaluateLegalDeadline(ProtectionMeasureType.ACOGIMIENTO_CIRCUNSTANCIAL, executedAt, notifiedAt);

      expect(result.isWithinLegalDeadline).toBe(false);
      expect(result.alert).toBeDefined();
    });

    it('las demás medidas no activan la regla de las 24h', () => {
      const result = evaluateLegalDeadline(ProtectionMeasureType.RESTITUCION_DOMICILIARIA, executedAt, null);

      expect(result.isWithinLegalDeadline).toBe(true);
      expect(result.alert).toBeUndefined();
    });
  });

  it('debería crear la medida y devolver alerta cuando el plazo legal se incumple', async () => {
    const dto = {
      measureType: ProtectionMeasureType.ACOGIMIENTO_CIRCUNSTANCIAL,
      reason: 'Riesgo inminente',
      executedAt: '2026-08-01T10:00:00Z',
      // sin judgeNotifiedAt
    };

    const result = await service.create('case-1', dto as any, user as any);

    expect(caseAccess.assertUserHasAccess).toHaveBeenCalledWith('case-1', user);
    expect(prisma.protectionMeasure.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        caseId: 'case-1',
        measureType: ProtectionMeasureType.ACOGIMIENTO_CIRCUNSTANCIAL,
        isWithinLegalDeadline: false,
      }),
    });
    expect(result.alert).toBeDefined();
  });

  it('no debería incluir alerta cuando el plazo legal se cumple', async () => {
    const dto = {
      measureType: ProtectionMeasureType.ACOGIMIENTO_CIRCUNSTANCIAL,
      reason: 'Riesgo inminente',
      executedAt: '2026-08-01T10:00:00Z',
      judgeNotifiedAt: '2026-08-01T22:00:00Z', // dentro de 24h
    };

    const result = await service.create('case-1', dto as any, user as any);

    expect(prisma.protectionMeasure.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ isWithinLegalDeadline: true }),
    });
    expect(result.alert).toBeUndefined();
  });

  it('debería listar las medidas de un caso', async () => {
    vi.mocked(prisma.protectionMeasure.findMany).mockResolvedValue([
      { id: 'pm-1', caseId: 'case-1' },
      { id: 'pm-2', caseId: 'case-1' },
    ] as any);

    const result = await service.findByCaseId('case-1');

    expect(prisma.protectionMeasure.findMany).toHaveBeenCalledWith({
      where: { caseId: 'case-1' },
      orderBy: { executedAt: 'desc' },
    });
    expect(result).toHaveLength(2);
  });

  it('debería actualizar por id validando acceso al caso y re-evaluando el plazo', async () => {
    vi.mocked(prisma.protectionMeasure.findUnique).mockResolvedValue({
      id: 'pm-1',
      caseId: 'case-1',
      measureType: ProtectionMeasureType.ACOGIMIENTO_CIRCUNSTANCIAL,
      executedAt: new Date('2026-08-01T10:00:00Z'),
      judgeNotifiedAt: null,
    } as any);

    const result = await service.update(
      'pm-1',
      { judgeNotifiedAt: '2026-08-03T10:00:00Z' } as any, // 48h después -> fuera de plazo
      user as any,
    );

    expect(caseAccess.assertUserHasAccess).toHaveBeenCalledWith('case-1', user);
    expect(prisma.protectionMeasure.update).toHaveBeenCalledWith({
      where: { id: 'pm-1' },
      data: expect.objectContaining({ isWithinLegalDeadline: false }),
    });
    expect(result.alert).toBeDefined();
  });

  it('debería lanzar NotFoundException si la medida no existe', async () => {
    vi.mocked(prisma.protectionMeasure.findUnique).mockResolvedValue(null);

    await expect(service.update('pm-ghost', {} as any, user as any)).rejects.toThrow(NotFoundException);
  });

  it('debería rechazar sin acceso al caso', async () => {
    vi.mocked(caseAccess.assertUserHasAccess).mockRejectedValue(new ForbiddenException('denied'));

    await expect(service.create('case-1', {} as any, user as any)).rejects.toThrow(ForbiddenException);
  });
});
