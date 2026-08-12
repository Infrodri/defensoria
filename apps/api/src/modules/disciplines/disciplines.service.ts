import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';
import { CreateReportTypeDto } from './dto/create-report-type.dto';

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
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: { reportTypes: true },
    });
  }

  async findOne(id: string) {
    const discipline = await this.prisma.discipline.findUnique({
      where: { id },
      include: { reportTypes: true },
    });

    if (!discipline) {
      throw new NotFoundException('Disciplina no encontrada');
    }

    return discipline;
  }

  async update(id: string, dto: UpdateDisciplineDto) {
    await this.findOne(id); // Verifica existencia
    return this.prisma.discipline.update({
      where: { id },
      data: dto,
    });
  }

  async addReportType(disciplineId: string, dto: CreateReportTypeDto) {
    await this.findOne(disciplineId);

    const existing = await this.prisma.disciplineReportType.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Ya existe un tipo de reporte con el código ${dto.code}`);
    }

    return this.prisma.disciplineReportType.create({
      data: {
        ...dto,
        disciplineId,
        template: dto.template ? JSON.parse(JSON.stringify(dto.template)) : null,
      },
    });
  }

  async updateReportType(id: string, dto: any) {
    return this.prisma.disciplineReportType.update({
      where: { id },
      data: dto,
    });
  }

  async removeReportType(id: string) {
    return this.prisma.disciplineReportType.delete({
      where: { id },
    });
  }

  async uploadReportTypeTemplate(id: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo no provisto');
    const template = {
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer.toString('base64'),
    };
    return this.prisma.disciplineReportType.update({
      where: { id },
      data: { template },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.discipline.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

