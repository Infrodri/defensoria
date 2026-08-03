import { Controller, Post, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SecurityTokenService } from './security-token.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@defensoria/shared';

class ActivateSecurityTokenDto {
  @ApiProperty({ description: 'Re-ingreso de contraseña del usuario para re-autenticación' })
  @IsNotEmpty({ message: 'La contraseña de confirmación es requerida' })
  passwordConfirm: string;
}

// Roles con acceso a contenido clínico/sensible
const CLINICAL_ROLES = [
  Role.ABOGADO,
  Role.PSICOLOGO,
  Role.SOCIAL,
  Role.JEFATURA,
  Role.ADMINISTRADOR,
];

@ApiTags('SecurityToken')
@Controller('security-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SecurityTokenController {
  constructor(private readonly securityTokenService: SecurityTokenService) {}

  @Post('activate')
  @Roles(...CLINICAL_ROLES)
  @ApiOperation({
    summary: 'Activar Token de Seguridad Documental — solo profesionales y jefatura (excluye Secretaría)',
    description: 'Re-autenticación obligatoria con TTL 15 min. Rol SECRETARIA no tiene acceso a contenido clínico sensible.',
  })
  async activate(
    @Body() dto: ActivateSecurityTokenDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    // Doble verificación defensiva aunque el guard ya lo bloquea
    if (userRole === Role.SECRETARIA || userRole === 'REFERENTE_TUTOR') {
      throw new ForbiddenException(
        'El rol Secretaría no tiene acceso a contenido clínico sensible. ' +
        'Solo profesionales (Abogado, Psicólogo, Trabajador Social) y Jefatura pueden activar el Token de Seguridad.',
      );
    }

    return this.securityTokenService.activate(userId, dto.passwordConfirm);
  }
}
