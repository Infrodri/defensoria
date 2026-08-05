import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { CreateSpecViolenciaSexualILEDto } from './dto/create-spec-violencia-sexual-ile.dto';
import { UpdateSpecViolenciaSexualILEDto } from './dto/update-spec-violencia-sexual-ile.dto';

@Injectable()
export class SpecViolenciaSexualILEService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  async create(caseId: string, dto: CreateSpecViolenciaSexualILEDto, user: AccessUser) {
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    const existing = await this.prisma.specViolenciaSexualILE.findUnique({ where: { caseId } });
    if (existing) {
      throw new BadRequestException('Ya existe un registro ILE para este caso');
    }

    return this.prisma.specViolenciaSexualILE.create({
      data: {
        caseId,
        copiaDenunciaAdjunta: dto.copiaDenunciaAdjunta ?? false,
        consentimientoNNA: dto.consentimientoNNA ?? false,
        atendidoDentro24h: dto.atendidoDentro24h ?? false,
        apersonamientoDNA: dto.apersonamientoDNA ?? true,
        delitoCalificado: dto.delitoCalificado,
        solicitoCamaraGesell: dto.solicitoCamaraGesell ?? false,
        certificadoMedicoUnico: dto.certificadoMedicoUnico ?? false,
        solicitoReserva: dto.solicitoReserva ?? true,
      },
    });
  }

  async findByCaseId(caseId: string) {
    return this.prisma.specViolenciaSexualILE.findUnique({ where: { caseId } });
  }

  async updateByCaseId(caseId: string, dto: UpdateSpecViolenciaSexualILEDto, user: AccessUser) {
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    const existing = await this.prisma.specViolenciaSexualILE.findUnique({ where: { caseId } });
    if (!existing) {
      throw new NotFoundException('No existe un registro ILE para este caso');
    }

    return this.prisma.specViolenciaSexualILE.update({
      where: { caseId },
      data: {
        ...(dto.copiaDenunciaAdjunta !== undefined && { copiaDenunciaAdjunta: dto.copiaDenunciaAdjunta }),
        ...(dto.consentimientoNNA !== undefined && { consentimientoNNA: dto.consentimientoNNA }),
        ...(dto.atendidoDentro24h !== undefined && { atendidoDentro24h: dto.atendidoDentro24h }),
        ...(dto.apersonamientoDNA !== undefined && { apersonamientoDNA: dto.apersonamientoDNA }),
        ...(dto.delitoCalificado !== undefined && { delitoCalificado: dto.delitoCalificado }),
        ...(dto.solicitoCamaraGesell !== undefined && { solicitoCamaraGesell: dto.solicitoCamaraGesell }),
        ...(dto.certificadoMedicoUnico !== undefined && { certificadoMedicoUnico: dto.certificadoMedicoUnico }),
        ...(dto.solicitoReserva !== undefined && { solicitoReserva: dto.solicitoReserva }),
      },
    });
  }
}
