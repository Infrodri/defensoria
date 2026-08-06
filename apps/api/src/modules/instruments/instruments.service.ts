import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InstrumentsService {
  constructor(private prisma: PrismaService) {}

  create(dto: any) {
    return this.prisma.instrument.create({
      data: dto
    });
  }

  findAll() {
    return this.prisma.instrument.findMany({
      include: {
        discipline: true,
        documentTemplate: true,
      },
      orderBy: { instrumentType: 'asc' },
    });
  }

  findByDiscipline(disciplineCode: string) {
    return this.prisma.instrument.findMany({
      where: {
        discipline: { code: disciplineCode },
        isActive: true,
      },
      include: {
        discipline: true,
        documentTemplate: true,
      },
      orderBy: { instrumentType: 'asc' },
    });
  }
}
