import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActionLogsService, CreateActionLogDto } from './action-logs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('ActionLogs')
@Controller('action-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActionLogsController {
  constructor(private readonly actionLogsService: ActionLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nueva actuación en la bitácora del expediente' })
  async create(@Body() dto: CreateActionLogDto, @CurrentUser('id') authorId: string) {
    return this.actionLogsService.create(dto, authorId);
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Obtener cronología de actuaciones del expediente' })
  async findByCase(@Param('caseId') caseId: string) {
    return this.actionLogsService.findByCase(caseId);
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Firmar actuación (Congela el contenido inmutablemente)' })
  async sign(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.actionLogsService.sign(id, userId);
  }
}
