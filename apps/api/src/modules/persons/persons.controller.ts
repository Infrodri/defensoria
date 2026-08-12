import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PersonsService, CreatePersonDto } from './persons.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Persons')
@Controller('persons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Búsqueda previa obligatoria de personas por documento o nombre (Anti-duplicación)' })
  @ApiQuery({ name: 'q', description: 'Número de documento o nombre', required: false })
  @ApiQuery({ name: 'query', description: 'Número de documento o nombre (alias)', required: false })
  async search(@Query('q') qParam?: string, @Query('query') queryParam?: string) {
    const query = qParam ?? queryParam ?? '';
    return this.personsService.search(query);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nueva persona (NNA, denunciante, denunciado, etc.)' })
  async create(@Body() dto: CreatePersonDto, @CurrentUser('id') userId: string) {
    return this.personsService.create(dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de persona por ID' })
  async findById(@Param('id') id: string) {
    return this.personsService.findById(id);
  }
}
