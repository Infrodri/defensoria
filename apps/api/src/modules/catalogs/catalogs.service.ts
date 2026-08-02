import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCatalogDto, UpdateCatalogDto } from './dto/catalog.dto';
import { CreateCatalogItemDto, UpdateCatalogItemDto } from './dto/catalog-item.dto';

@Injectable()
export class CatalogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.systemCatalog.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findOne(code: string) {
    const catalog = await this.prisma.systemCatalog.findUnique({
      where: { code },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!catalog) {
      throw new NotFoundException(`Catalog with code ${code} not found`);
    }

    return catalog;
  }

  async createCatalog(dto: CreateCatalogDto) {
    return this.prisma.systemCatalog.create({
      data: dto,
    });
  }

  async updateCatalog(id: string, dto: UpdateCatalogDto) {
    return this.prisma.systemCatalog.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCatalog(id: string) {
    return this.prisma.systemCatalog.delete({
      where: { id },
    });
  }

  // Items
  async createItem(catalogId: string, dto: CreateCatalogItemDto) {
    return this.prisma.catalogItem.create({
      data: {
        ...dto,
        catalogId,
      },
    });
  }

  async updateItem(itemId: string, dto: UpdateCatalogItemDto) {
    return this.prisma.catalogItem.update({
      where: { id: itemId },
      data: dto,
    });
  }

  async deleteItem(itemId: string) {
    return this.prisma.catalogItem.delete({
      where: { id: itemId },
    });
  }
}
