import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActionType } from '@defensoria/shared';

export interface CreateActionLogDto {
  caseId: string;
  actionType: ActionType;
  title: string;
  content: string;
}

@Injectable()
export class ActionLogsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateActionLogDto, authorId: string) {
    const existingCase = await this.prisma.case.findUnique({ where: { id: dto.caseId } });
    if (!existingCase) {
      throw new NotFoundException('Expediente no encontrado');
    }

    return this.prisma.actionLog.create({
      data: {
        caseId: dto.caseId,
        authorId,
        actionType: dto.actionType || ActionType.NOTA,
        title: dto.title,
        content: dto.content,
      },
    });
  }

  async findByCase(caseId: string) {
    return this.prisma.actionLog.findMany({
      where: { caseId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sign(id: string, userId: string) {
    const actionLog = await this.prisma.actionLog.findUnique({ where: { id } });

    if (!actionLog) {
      throw new NotFoundException('Actuación no encontrada');
    }

    if (actionLog.authorId !== userId) {
      throw new BadRequestException('Solo el autor original puede firmar la actuación');
    }

    if (actionLog.isSigned) {
      throw new BadRequestException('Esta actuación ya ha sido firmada previamente');
    }

    return this.prisma.actionLog.update({
      where: { id },
      data: {
        isSigned: true,
        signedAt: new Date(),
      },
    });
  }
}
