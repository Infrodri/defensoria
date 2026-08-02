import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PortalAuthService } from './portal-auth.service';

@ApiTags('Portal Externo')
@Controller('portal/auth')
export class PortalAuthController {
  constructor(private readonly portalAuthService: PortalAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión en el portal externo para tutores usando Código de Caso y PIN' })
  async login(@Body('caseCode') caseCode: string, @Body('pin') pin: string) {
    return this.portalAuthService.loginPortal(caseCode, pin);
  }
}
