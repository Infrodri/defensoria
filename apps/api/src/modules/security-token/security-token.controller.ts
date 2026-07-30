import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SecurityTokenService } from './security-token.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class ActivateSecurityTokenDto {
  @ApiProperty({ description: 'Re-ingreso de contraseña del usuario para re-autenticación' })
  @IsNotEmpty({ message: 'La contraseña de confirmación es requerida' })
  passwordConfirm: string;
}

@ApiTags('SecurityToken')
@Controller('security-token')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SecurityTokenController {
  constructor(private readonly securityTokenService: SecurityTokenService) {}

  @Post('activate')
  @ApiOperation({ summary: 'Activar Token de Seguridad Documental (Re-autenticación obligatoria con TTL 15 min)' })
  async activate(
    @Body() dto: ActivateSecurityTokenDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.securityTokenService.activate(userId, dto.passwordConfirm);
  }
}
