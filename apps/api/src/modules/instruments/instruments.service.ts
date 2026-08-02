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
    return this.prisma.instrument.findMany();
  }
}
