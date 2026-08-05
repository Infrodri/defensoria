import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { CreateSpecViolenceDigitalDto } from './dto/create-spec-violence-digital.dto';
import { UpdateSpecViolenceDigitalDto } from './dto/update-spec-violence-digital.dto';

@Injectable()
export class SpecViolenceDigitalService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  async create(caseId: string, dto: CreateSpecViolenceDigitalDto, user: AccessUser) {
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    const existing = await this.prisma.specViolenceDigital.findUnique({ where: { caseId } });
    if (existing) {
      throw new BadRequestException('Ya existe un registro de violencia digital para este caso');
    }

    return this.prisma.specViolenceDigital.create({
      data: {
        caseId,
        urls: dto.urls ?? [],
        platforms: dto.platforms ?? [],
        usedDevices: dto.usedDevices ?? [],
        coercionMethods: dto.coercionMethods ?? [],
        metadataPreserved: (dto.metadataPreserved ?? {}) as object,
        requiresForensic: dto.requiresForensic ?? false,
        phoneOperator: dto.phoneOperator,
        phoneOwnerVerified: dto.phoneOwnerVerified,
        callRegistryExt: dto.callRegistryExt as object | null | undefined,
      },
    });
  }

  async findByCaseId(caseId: string) {
    return this.prisma.specViolenceDigital.findUnique({ where: { caseId } });
  }

  async updateByCaseId(caseId: string, dto: UpdateSpecViolenceDigitalDto, user: AccessUser) {
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    const existing = await this.prisma.specViolenceDigital.findUnique({ where: { caseId } });
    if (!existing) {
      throw new NotFoundException('No existe un registro de violencia digital para este caso');
    }

    return this.prisma.specViolenceDigital.update({
      where: { caseId },
      data: {
        ...(dto.urls !== undefined && { urls: dto.urls }),
        ...(dto.platforms !== undefined && { platforms: dto.platforms }),
        ...(dto.usedDevices !== undefined && { usedDevices: dto.usedDevices }),
        ...(dto.coercionMethods !== undefined && { coercionMethods: dto.coercionMethods }),
        ...(dto.metadataPreserved !== undefined && { metadataPreserved: dto.metadataPreserved as object }),
        ...(dto.requiresForensic !== undefined && { requiresForensic: dto.requiresForensic }),
        ...(dto.phoneOperator !== undefined && { phoneOperator: dto.phoneOperator }),
        ...(dto.phoneOwnerVerified !== undefined && { phoneOwnerVerified: dto.phoneOwnerVerified }),
        ...(dto.callRegistryExt !== undefined && { callRegistryExt: dto.callRegistryExt as object }),
      },
    });
  }
}
