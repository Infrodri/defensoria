import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';

@Injectable()
export class DisciplinesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDisciplineDto) {
    const existing = await this.prisma.discipline.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una disciplina con el código ${dto.code}`);
    }

    return this.prisma.discipline.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.discipline.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const discipline = await this.prisma.discipline.findUnique({
      where: { id },
    });

    if (!discipline) {
      throw new NotFoundException('Disciplina no encontrada');
    }

    return discipline;
  }

  async update(id: string, dto: UpdateDisciplineDto) {
    await this.findOne(id);
    return this.prisma.discipline.update({
      where: { id },
      data: dto,
    });
  }
}
