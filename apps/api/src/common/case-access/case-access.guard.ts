import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { CaseAccessService } from './case-access.service';
import { Role } from '@prisma/client';

/**
 * Guard real CanActivate para validación de acceso a expedientes.
 *
 * Decisión (documentada): el guard lee el caseId del request directamente vía
 * `request.params.caseId ?? request.params.id`, cubriendo tanto las rutas que
 * nombran el parámetro `caseId` (appointments/case/:caseId, conciliation,
 * social-intake) como las que usan `:id` (cases/:id). No se agregó un decorador
 * `@CaseIdParam()` nuevo: la convención de params en los controllers ya es
 * consistente y el guard se configura en la ruta con @UseGuards(CaseAccessGuard).
 *
 * Caso sin caseId en la ruta (p. ej. GET /cases/analytics): solo los roles de
 * alcance global (ADMINISTRADOR, JEFATURA, SECRETARIA — reglas a/b del
 * CaseAccessService) pueden acceder. Los profesionales de campo solo acceden
 * vía membresía activa en un caso específico, por lo que quedan denegados.
 */
@Injectable()
export class CaseAccessGuard implements CanActivate {
  constructor(private readonly caseAccessService: CaseAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const caseId = request.params?.caseId ?? request.params?.id;
    const user = request.user;

    if (!caseId) {
      const staffRoles: Role[] = [Role.ADMINISTRADOR, Role.JEFATURA, Role.SECRETARIA];
      if (!user || !staffRoles.includes(user.role)) {
        throw new ForbiddenException('No tiene permisos para acceder a este recurso');
      }
      return true;
    }

    await this.caseAccessService.assertUserHasAccess(caseId, user);
    return true;
  }
}
