import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { CaseAccessService } from './case-access.service';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { Role } from '@prisma/client';

/**
 * Guard CanActivate para la validación de acceso a expedientes y sub-recursos.
 *
 * Resuelve automáticamente el `caseId` tanto si la ruta recibe `:caseId` directamente
 * como si recibe `:id` apuntando a un expediente o a un sub-recurso (Evidence, Report, Appointment).
 */
@Injectable()
export class CaseAccessGuard implements CanActivate {
  constructor(
    private readonly caseAccessService: CaseAccessService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rawId = request.params?.caseId ?? request.params?.id;
    const user = request.user;

    if (!rawId) {
      const staffRoles: Role[] = [Role.ADMINISTRADOR, Role.JEFATURA, Role.SECRETARIA];
      if (!user || !staffRoles.includes(user.role)) {
        throw new ForbiddenException('No tiene permisos para acceder a este recurso');
      }
      return true;
    }

    let resolvedCaseId = rawId;

    // Si la ruta usó :id (en lugar de :caseId), determinar si el id corresponde
    // directamente al Case o a un sub-recurso (Evidence, Report, Appointment)
    if (!request.params?.caseId && request.params?.id && this.prisma) {
      const isCase = await this.prisma.case.findUnique({
        where: { id: rawId },
        select: { id: true },
      });

      if (!isCase) {
        // 1. Probar si es una Evidencia
        const evidence = await this.prisma.evidence.findUnique({
          where: { id: rawId },
          select: { caseId: true },
        });
        if (evidence) {
          resolvedCaseId = evidence.caseId;
        } else {
          // 2. Probar si es un Reporte
          const report = await this.prisma.report.findUnique({
            where: { id: rawId },
            select: { caseId: true },
          });
          if (report) {
            resolvedCaseId = report.caseId;
          } else {
            // 3. Probar si es una Cita
            const appt = await this.prisma.appointment.findUnique({
              where: { id: rawId },
              select: { caseId: true },
            });
            if (appt) {
              resolvedCaseId = appt.caseId;
            }
          }
        }
      }
    }

    await this.caseAccessService.assertUserHasAccess(resolvedCaseId, user);
    return true;
  }
}
