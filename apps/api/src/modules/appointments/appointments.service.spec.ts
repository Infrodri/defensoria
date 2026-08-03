import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Role, AppointmentStatus } from '@defensoria/shared';

describe('AppointmentsService Integration Tests', () => {
  let appointmentsService: AppointmentsService;
  let prisma: PrismaService;

beforeEach(async () => {
    const prismaMock = {
      appointment: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'apt-1',
          caseId: 'case-1',
          assignedProfessionalId: 'prof-old',
          status: AppointmentStatus.PROGRAMADA,
          creator: { id: 'creator-1' },
        }),
        update: vi.fn().mockResolvedValue({ id: 'apt-1', assignedProfessionalId: 'prof-new' }),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'prof-new', role: Role.PSICOLOGO }),
      },
      caseTeamHistory: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn().mockResolvedValue({ id: 'cth-new', caseId: 'case-1', role: Role.PSICOLOGO, userId: 'prof-new', endDate: null }),
      },
      actionLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    appointmentsService = module.get<AppointmentsService>(AppointmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('reassign (Fix 1: cerrar fila activa previa del mismo caseId+role)', () => {
    it('debería cerrar CaseTeamHistory activo previo (caseId+role) antes de crear la nueva', async () => {
      const mockTx = {
        appointment: {
          update: vi.fn().mockResolvedValue({ id: 'apt-1', assignedProfessionalId: 'prof-new' }),
        },
        caseTeamHistory: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          create: vi.fn().mockResolvedValue({ id: 'cth-new', caseId: 'case-1', role: Role.PSICOLOGO, userId: 'prof-new', endDate: null, assignedBy: 'current-user', reason: 'reassign reason' }),
        },
        actionLog: { create: vi.fn() },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx));

      await appointmentsService.reassign('apt-1', 'prof-new', 'reassign reason', 'current-user');

      // 1. Cerrar fila activa del MISMO (caseId, role del nuevo profesional)
      expect(mockTx.caseTeamHistory.updateMany).toHaveBeenCalledWith({
        where: {
          caseId: 'case-1',
          role: Role.PSICOLOGO,
          endDate: null,
        },
        data: { endDate: expect.any(Date) },
      });

      // 2. Crear nueva fila CaseTeamHistory para el nuevo profesional
      expect(mockTx.caseTeamHistory.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          caseId: 'case-1',
          userId: 'prof-new',
          role: Role.PSICOLOGO,
          // endDate no se pasa explícitamente (default null en schema)
        }),
      }));
    });
  });

  describe('updateStatus (solo status + reason, sin contenido de sesión)', () => {
    it('debería actualizar status y crear actionLog', async () => {
      vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
        id: 'apt-1',
        caseId: 'case-1',
        assignedProfessionalId: 'prof-1',
        status: AppointmentStatus.CONFIRMADA,
      } as any);

      await appointmentsService.updateStatus('apt-1', AppointmentStatus.COMPLETADA, 'Sesión completada', 'prof-1');

      // Verificar que update se llamó con where correcto y status en data (ignora include, updatedAt, etc.)
      const updateCall = vi.mocked(prisma.appointment.update).mock.calls[0][0];
      expect(updateCall.where).toEqual({ id: 'apt-1' });
      expect(updateCall.data.status).toBe(AppointmentStatus.COMPLETADA);
      // updateStatus NO crea actionLog (solo cambia estado); actionLog se crea en respond/reassign
    });
  });
});