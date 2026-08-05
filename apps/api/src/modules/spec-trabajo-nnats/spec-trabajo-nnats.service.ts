import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { CreateSpecTrabajoNNATSDto } from './dto/create-spec-trabajo-nnats.dto';
import { UpdateSpecTrabajoNNATSDto } from './dto/update-spec-trabajo-nnats.dto';

@Injectable()
export class SpecTrabajoNNATSService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  async create(caseId: string, dto: CreateSpecTrabajoNNATSDto, user: AccessUser) {
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    const existing = await this.prisma.specTrabajoNNATS.findUnique({ where: { caseId } });
    if (existing) {
      throw new BadRequestException('Ya existe un formulario NNATS para este caso');
    }

    return this.prisma.specTrabajoNNATS.create({
      data: {
        caseId,
        hasEscolaridadCert: dto.hasEscolaridadCert ?? false,
        hasAptitudMedicaSUS: dto.hasAptitudMedicaSUS ?? false,
        inspeccionRealizada: dto.inspeccionRealizada ?? false,
        fechaInspeccion: dto.fechaInspeccion ? new Date(dto.fechaInspeccion) : null,
        inspectorId: dto.inspectorId,
        risksIdentified: dto.risksIdentified ?? [],
        isProhibitedWork: dto.isProhibitedWork ?? false,
        hoursPerWeek: dto.hoursPerWeek,
        salaryBs: dto.salaryBs,
        studyHoursGrant: dto.studyHoursGrant ?? true,
        hasSocialSecurity: dto.hasSocialSecurity ?? false,
      },
    });
  }

  async findByCaseId(caseId: string) {
    return this.prisma.specTrabajoNNATS.findUnique({ where: { caseId } });
  }

  async updateByCaseId(caseId: string, dto: UpdateSpecTrabajoNNATSDto, user: AccessUser) {
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    const existing = await this.prisma.specTrabajoNNATS.findUnique({ where: { caseId } });
    if (!existing) {
      throw new NotFoundException('No existe un formulario NNATS para este caso');
    }

    return this.prisma.specTrabajoNNATS.update({
      where: { caseId },
      data: {
        ...(dto.hasEscolaridadCert !== undefined && { hasEscolaridadCert: dto.hasEscolaridadCert }),
        ...(dto.hasAptitudMedicaSUS !== undefined && { hasAptitudMedicaSUS: dto.hasAptitudMedicaSUS }),
        ...(dto.inspeccionRealizada !== undefined && { inspeccionRealizada: dto.inspeccionRealizada }),
        ...(dto.fechaInspeccion !== undefined && { fechaInspeccion: new Date(dto.fechaInspeccion) }),
        ...(dto.inspectorId !== undefined && { inspectorId: dto.inspectorId }),
        ...(dto.risksIdentified !== undefined && { risksIdentified: dto.risksIdentified }),
        ...(dto.isProhibitedWork !== undefined && { isProhibitedWork: dto.isProhibitedWork }),
        ...(dto.hoursPerWeek !== undefined && { hoursPerWeek: dto.hoursPerWeek }),
        ...(dto.salaryBs !== undefined && { salaryBs: dto.salaryBs }),
        ...(dto.studyHoursGrant !== undefined && { studyHoursGrant: dto.studyHoursGrant }),
        ...(dto.hasSocialSecurity !== undefined && { hasSocialSecurity: dto.hasSocialSecurity }),
      },
    });
  }
}
