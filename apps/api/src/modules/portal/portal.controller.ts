import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Portal Externo')
@Controller('portal')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('status')
  @ApiOperation({ summary: 'Obtener estado público general del caso (solo para tutor autenticado con PIN)' })
  async getStatus(@Request() req: any) {
    const caseId = req.user.sub;
    return this.portalService.getPortalStatus(caseId);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Obtener próximas citas del caso (solo para tutor autenticado con PIN)' })
  async getAppointments(@Request() req: any) {
    const caseId = req.user.sub;
    return this.portalService.getPortalAppointments(caseId);
  }
}
