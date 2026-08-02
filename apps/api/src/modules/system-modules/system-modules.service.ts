import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateSystemModuleDto {
  code: string;
  name: string;
  description?: string;
  permissions: Record<string, string>;
}

export interface UpdateSystemModuleDto {
  name?: string;
  description?: string;
  permissions?: Record<string, string>;
}

@Injectable()
export class SystemModulesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.systemModule.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const moduleItem = await this.prisma.systemModule.findUnique({
      where: { id },
    });

    if (!moduleItem) {
      throw new NotFoundException(`Módulo con ID ${id} no encontrado`);
    }

    return moduleItem;
  }

  async create(dto: CreateSystemModuleDto) {
    const code = dto.code.toUpperCase().replace(/\s+/g, '_');
    const existing = await this.prisma.systemModule.findUnique({
      where: { code },
    });

    if (existing) {
      throw new BadRequestException(`Ya existe un módulo registrado con el código ${code}`);
    }

    return this.prisma.systemModule.create({
      data: {
        code,
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions || {
          ADMINISTRADOR: '✅ Total',
          JEFATURA: '❌',
          ABOGADO: '❌',
          PSICOLOGO: '❌',
          SOCIAL: '❌',
          SECRETARIA: '❌',
        },
        isCustom: true,
      },
    });
  }

  async update(id: string, dto: UpdateSystemModuleDto) {
    await this.findOne(id);

    return this.prisma.systemModule.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.permissions && { permissions: dto.permissions }),
      },
    });
  }

  async remove(id: string) {
    const moduleItem = await this.findOne(id);
    if (!moduleItem.isCustom) {
      throw new BadRequestException('Los módulos nativos del sistema no se pueden eliminar, solo modificar sus permisos.');
    }

    return this.prisma.systemModule.delete({
      where: { id },
    });
  }
}
