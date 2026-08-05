import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { CreateSpecSituacionCalleDto } from './dto/create-spec-situacion-calle.dto';
import { UpdateSpecSituacionCalleDto } from './dto/update-spec-situacion-calle.dto';

@Injectable()
export class SpecSituacionCalleService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  async create(caseId: string, dto: CreateSpecSituacionCalleDto, user: AccessUser) {
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    const existing = await this.prisma.specSituacionCalle.findUnique({ where: { caseId } });
    if (existing) {
      throw new BadRequestException('Ya existe un registro de situación de calle para este caso');
    }

    return this.prisma.specSituacionCalle.create({
      data: {
        caseId,
        faseActual: dto.faseActual ?? 'ADHERENCIA',
        programaReferente: dto.programaReferente,
        educadorCalleRef: dto.educadorCalleRef,
        yearsOnStreet: dto.yearsOnStreet,
        survivalStrategy: dto.survivalStrategy,
        substanceAbuse: dto.substanceAbuse ?? [],
        streetHistory: dto.streetHistory,
        idFormReferencia: dto.idFormReferencia,
        idFormContraref: dto.idFormContraref,
        notificadoITD: dto.notificadoITD ?? false,
        fechaNotificacion: dto.fechaNotificacion ? new Date(dto.fechaNotificacion) : null,
      },
    });
  }

  async findByCaseId(caseId: string) {
    return this.prisma.specSituacionCalle.findUnique({ where: { caseId } });
  }

  async updateByCaseId(caseId: string, dto: UpdateSpecSituacionCalleDto, user: AccessUser) {
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    const existing = await this.prisma.specSituacionCalle.findUnique({ where: { caseId } });
    if (!existing) {
      throw new NotFoundException('No existe un registro de situación de calle para este caso');
    }

    return this.prisma.specSituacionCalle.update({
      where: { caseId },
      data: {
        ...(dto.faseActual !== undefined && { faseActual: dto.faseActual }),
        ...(dto.programaReferente !== undefined && { programaReferente: dto.programaReferente }),
        ...(dto.educadorCalleRef !== undefined && { educadorCalleRef: dto.educadorCalleRef }),
        ...(dto.yearsOnStreet !== undefined && { yearsOnStreet: dto.yearsOnStreet }),
        ...(dto.survivalStrategy !== undefined && { survivalStrategy: dto.survivalStrategy }),
        ...(dto.substanceAbuse !== undefined && { substanceAbuse: dto.substanceAbuse }),
        ...(dto.streetHistory !== undefined && { streetHistory: dto.streetHistory }),
        ...(dto.idFormReferencia !== undefined && { idFormReferencia: dto.idFormReferencia }),
        ...(dto.idFormContraref !== undefined && { idFormContraref: dto.idFormContraref }),
        ...(dto.notificadoITD !== undefined && { notificadoITD: dto.notificadoITD }),
        ...(dto.fechaNotificacion !== undefined && { fechaNotificacion: new Date(dto.fechaNotificacion) }),
      },
    });
  }
}
