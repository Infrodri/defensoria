import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Timeline')
@Controller('cases/:caseId/timeline')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener línea de tiempo procesal consolidada del expediente' })
  async getTimeline(@Param('caseId') caseId: string) {
    return this.timelineService.getCaseTimeline(caseId);
  }
}
