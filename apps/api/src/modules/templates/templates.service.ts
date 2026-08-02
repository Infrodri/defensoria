import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  create(dto: any) {
    return this.prisma.documentTemplate.create({
      data: dto
    });
  }

  findAll() {
    return this.prisma.documentTemplate.findMany();
  }
}
