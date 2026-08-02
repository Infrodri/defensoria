import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateOfficeDto {
  code: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateOfficeDto {
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

@Injectable()
export class OfficesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const offices = await this.prisma.office.findMany({
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: {
            users: true,
            currentCases: true,
          },
        },
      },
    });

    return offices;
  }

  async findOne(id: string) {
    const office = await this.prisma.office.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        currentCases: {
          select: {
            id: true,
            caseCode: true,
            caseType: true,
            currentPhase: true,
            riskLevel: true,
            isClosed: true,
          },
        },
      },
    });

    if (!office) {
      throw new NotFoundException(`Oficina con ID ${id} no encontrada`);
    }

    return office;
  }

  async create(dto: CreateOfficeDto) {
    const existing = await this.prisma.office.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException(`Ya existe una oficina con el código ${dto.code}`);
    }

    return this.prisma.office.create({
      data: {
        code: dto.code.toUpperCase(),
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
      },
    });
  }

  async update(id: string, dto: UpdateOfficeDto) {
    await this.findOne(id);

    return this.prisma.office.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }
}
