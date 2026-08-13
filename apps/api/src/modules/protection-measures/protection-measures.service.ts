import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { CreateProtectionMeasureDto } from './dto/create-protection-measure.dto';
import { UpdateProtectionMeasureDto } from './dto/update-protection-measure.dto';
import { ProtectionMeasureType } from '@prisma/client';

/**
 * Regla normativa (DNA ): para la medida ACOGIMIENTO_CIRCUNSTANCIAL la
 * notificación al juzgado debe realizarse dentro de las 24 horas siguientes a la
 * ejecución de la medida. Si no hay notificación registrada o excede las 24h,
 * isWithinLegalDeadline=false y se devuelve una alerta en la respuesta.
 */
export const LEGAL_NOTIFICATION_WINDOW_MS = 24 * 60 * 60 * 1000;

export function evaluateLegalDeadline(
  measureType: ProtectionMeasureType,
  executedAt: Date,
  judgeNotifiedAt: Date | null | undefined,
): { isWithinLegalDeadline: boolean; alert?: string } {
  if (measureType !== ProtectionMeasureType.ACOGIMIENTO_CIRCUNSTANCIAL) {
    return { isWithinLegalDeadline: true };
  }

  if (!judgeNotifiedAt) {
    return {
      isWithinLegalDeadline: false,
      alert:
        'ALERTA: Medida ACOGIMIENTO_CIRCUNSTANCIAL sin notificación judicial. La normativa exige notificar al juzgado dentro de las 24 horas de ejecutada la medida.',
    };
  }

  const deadline = new Date(executedAt.getTime() + LEGAL_NOTIFICATION_WINDOW_MS);
  if (new Date(judgeNotifiedAt).getTime() > deadline.getTime()) {
    return {
      isWithinLegalDeadline: false,
      alert:
        'ALERTA: La notificación judicial de la medida ACOGIMIENTO_CIRCUNSTANCIAL excede las 24 horas reglamentarias desde su ejecución.',
    };
  }

  return { isWithinLegalDeadline: true };
}

@Injectable()
export class ProtectionMeasuresService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  async create(caseId: string, dto: CreateProtectionMeasureDto, user: AccessUser) {
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    const executedAt = dto.executedAt ? new Date(dto.executedAt) : new Date();
    const judgeNotifiedAt = dto.judgeNotifiedAt ? new Date(dto.judgeNotifiedAt) : null;
    const evaluation = evaluateLegalDeadline(dto.measureType, executedAt, judgeNotifiedAt);

    const measure = await this.prisma.protectionMeasure.create({
      data: {
        caseId,
        measureType: dto.measureType,
        reason: dto.reason,
        receptiveCenterName: dto.receptiveCenterName,
        executedAt,
        judgeNotifiedAt,
        judgeNotificationCode: dto.judgeNotificationCode,
        isWithinLegalDeadline:
          dto.measureType === ProtectionMeasureType.ACOGIMIENTO_CIRCUNSTANCIAL
            ? evaluation.isWithinLegalDeadline
            : (dto.isWithinLegalDeadline ?? true),
      },
    });

    return evaluation.alert ? { ...measure, alert: evaluation.alert } : measure;
  }

  async findByCaseId(caseId: string) {
    return this.prisma.protectionMeasure.findMany({
      where: { caseId },
      orderBy: { executedAt: 'desc' },
    });
  }

  async findById(id: string, user: AccessUser) {
    const record = await this.prisma.protectionMeasure.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Medida de protección no encontrada');
    }
    await this.caseAccessService.assertUserHasAccess(record.caseId, user);
    return record;
  }

  async update(id: string, dto: UpdateProtectionMeasureDto, user: AccessUser) {
    const record = await this.prisma.protectionMeasure.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Medida de protección no encontrada');
    }
    await this.caseAccessService.assertUserHasAccess(record.caseId, user);

    const measureType = dto.measureType ?? record.measureType;
    const executedAt = dto.executedAt ? new Date(dto.executedAt) : record.executedAt;
    const judgeNotifiedAt =
      dto.judgeNotifiedAt !== undefined
        ? dto.judgeNotifiedAt
          ? new Date(dto.judgeNotifiedAt)
          : null
        : record.judgeNotifiedAt;
    const evaluation = evaluateLegalDeadline(measureType, executedAt, judgeNotifiedAt);

    const updated = await this.prisma.protectionMeasure.update({
      where: { id },
      data: {
        ...(dto.measureType !== undefined && { measureType: dto.measureType }),
        ...(dto.reason !== undefined && { reason: dto.reason }),
        ...(dto.receptiveCenterName !== undefined && { receptiveCenterName: dto.receptiveCenterName }),
        ...(dto.executedAt !== undefined && { executedAt: new Date(dto.executedAt) }),
        ...(dto.judgeNotifiedAt !== undefined && { judgeNotifiedAt: judgeNotifiedAt }),
        ...(dto.judgeNotificationCode !== undefined && { judgeNotificationCode: dto.judgeNotificationCode }),
        isWithinLegalDeadline:
          measureType === ProtectionMeasureType.ACOGIMIENTO_CIRCUNSTANCIAL
            ? evaluation.isWithinLegalDeadline
            : (dto.isWithinLegalDeadline ?? record.isWithinLegalDeadline),
      },
    });

    return evaluation.alert ? { ...updated, alert: evaluation.alert } : updated;
  }
}
