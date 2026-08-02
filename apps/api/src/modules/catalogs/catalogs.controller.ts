import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CreateCatalogDto, UpdateCatalogDto } from './dto/catalog.dto';
import { CreateCatalogItemDto, UpdateCatalogItemDto } from './dto/catalog-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@defensoria/shared';

@Controller('catalogs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get()
  async findAll() {
    return this.catalogsService.findAll();
  }

  @Get(':code')
  async findOne(@Param('code') code: string) {
    return this.catalogsService.findOne(code);
  }

  @Post()
  @Roles(Role.ADMINISTRADOR)
  async createCatalog(@Body() dto: CreateCatalogDto) {
    return this.catalogsService.createCatalog(dto);
  }

  @Put(':id')
  @Roles(Role.ADMINISTRADOR)
  async updateCatalog(@Param('id') id: string, @Body() dto: UpdateCatalogDto) {
    return this.catalogsService.updateCatalog(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR)
  async deleteCatalog(@Param('id') id: string) {
    return this.catalogsService.deleteCatalog(id);
  }

  @Post(':catalogId/items')
  @Roles(Role.ADMINISTRADOR)
  async createItem(@Param('catalogId') catalogId: string, @Body() dto: CreateCatalogItemDto) {
    return this.catalogsService.createItem(catalogId, dto);
  }

  @Put('items/:itemId')
  @Roles(Role.ADMINISTRADOR)
  async updateItem(@Param('itemId') itemId: string, @Body() dto: UpdateCatalogItemDto) {
    return this.catalogsService.updateItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @Roles(Role.ADMINISTRADOR)
  async deleteItem(@Param('itemId') itemId: string) {
    return this.catalogsService.deleteItem(itemId);
  }
}
