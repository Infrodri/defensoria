import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { CreateTravelPermissionDto } from './dto/create-travel-permission.dto';
import { UpdateTravelPermissionDto } from './dto/update-travel-permission.dto';

/** Formato de código de autorización: TV-YYYY-NNNN */
export function generateAuthorizationCode(seq: number, year: number): string {
  return `TV-${year}-${String(seq).padStart(4, '0')}`;
}

/** Roles con alcance global para permisos sin expediente asociado. */
const STAFF_ROLES: string[] = ['ADMINISTRADOR', 'JEFATURA', 'SECRETARIA'];

@Injectable()
export class TravelPermissionsService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  private assertStaffForUnlinkedCase(user: AccessUser, caseId: string | undefined) {
    if (!caseId && !STAFF_ROLES.includes(user.role as string)) {
      throw new ForbiddenException('Solo JEFATURA o ADMINISTRADOR puede gestionar permisos de viaje sin expediente asociado');
    }
  }

  private assertDepartureDateInFuture(departureDate: string) {
    const departure = new Date(departureDate);
    if (departure.getTime() <= Date.now()) {
      throw new BadRequestException('La fecha de salida debe ser futura');
    }
  }

  async create(dto: CreateTravelPermissionDto, user: AccessUser) {
    this.assertDepartureDateInFuture(dto.departureDate);
    this.assertStaffForUnlinkedCase(user, dto.caseId);

    if (dto.caseId) {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, user);
    }

    let authorizationCode = dto.authorizationCode;
    if (!authorizationCode) {
      const year = new Date().getFullYear();
      const seq = await this.prisma.travelPermission.count({
        where: { authorizationCode: { startsWith: `TV-${year}-` } },
      });
      authorizationCode = generateAuthorizationCode(seq + 1, year);
    }

    return this.prisma.travelPermission.create({
      data: {
        caseId: dto.caseId,
        travelType: dto.travelType,
        companionType: dto.companionType,
        originCity: dto.originCity ?? 'Sucre',
        destinationCity: dto.destinationCity,
        departureDate: new Date(dto.departureDate),
        returnDate: dto.returnDate ? new Date(dto.returnDate) : null,
        companionFullName: dto.companionFullName,
        companionIdentityNumber: dto.companionIdentityNumber,
        companionRelation: dto.companionRelation,
        bothParentsPresent: dto.bothParentsPresent ?? true,
        oppositionNotes: dto.oppositionNotes,
        authorizationCode,
        isIssued: dto.isIssued ?? false,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : null,
        issuedById: dto.issuedById,
      },
    });
  }

  async findByCaseId(caseId: string) {
    return this.prisma.travelPermission.findUnique({ where: { caseId } });
  }

  async findById(id: string, user: AccessUser) {
    const record = await this.prisma.travelPermission.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Permiso de viaje no encontrado');
    }

    if (record.caseId) {
      await this.caseAccessService.assertUserHasAccess(record.caseId, user);
    } else {
      this.assertStaffForUnlinkedCase(user, record.caseId);
    }

    return record;
  }

  async update(id: string, dto: UpdateTravelPermissionDto, user: AccessUser) {
    const record = await this.prisma.travelPermission.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Permiso de viaje no encontrado');
    }

    if (record.caseId) {
      await this.caseAccessService.assertUserHasAccess(record.caseId, user);
    } else {
      this.assertStaffForUnlinkedCase(user, record.caseId);
    }

    if (dto.departureDate !== undefined) {
      this.assertDepartureDateInFuture(dto.departureDate);
    }

    return this.prisma.travelPermission.update({
      where: { id },
      data: {
        ...(dto.travelType !== undefined && { travelType: dto.travelType }),
        ...(dto.companionType !== undefined && { companionType: dto.companionType }),
        ...(dto.originCity !== undefined && { originCity: dto.originCity }),
        ...(dto.destinationCity !== undefined && { destinationCity: dto.destinationCity }),
        ...(dto.departureDate !== undefined && { departureDate: new Date(dto.departureDate) }),
        ...(dto.returnDate !== undefined && { returnDate: dto.returnDate ? new Date(dto.returnDate) : null }),
        ...(dto.companionFullName !== undefined && { companionFullName: dto.companionFullName }),
        ...(dto.companionIdentityNumber !== undefined && { companionIdentityNumber: dto.companionIdentityNumber }),
        ...(dto.companionRelation !== undefined && { companionRelation: dto.companionRelation }),
        ...(dto.bothParentsPresent !== undefined && { bothParentsPresent: dto.bothParentsPresent }),
        ...(dto.oppositionNotes !== undefined && { oppositionNotes: dto.oppositionNotes }),
        ...(dto.authorizationCode !== undefined && { authorizationCode: dto.authorizationCode }),
        ...(dto.isIssued !== undefined && { isIssued: dto.isIssued }),
        ...(dto.issuedAt !== undefined && { issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : null }),
        ...(dto.issuedById !== undefined && { issuedById: dto.issuedById }),
      },
    });
  }
}
