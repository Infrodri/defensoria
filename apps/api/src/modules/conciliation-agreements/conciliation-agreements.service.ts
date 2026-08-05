import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { CreateConciliationAgreementDto } from './dto/create-conciliation-agreement.dto';
import { UpdateConciliationAgreementDto } from './dto/update-conciliation-agreement.dto';

@Injectable()
export class ConciliationAgreementsService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  async create(caseId: string, dto: CreateConciliationAgreementDto, user: AccessUser) {
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    const existing = await this.prisma.conciliationAgreement.findUnique({ where: { caseId } });
    if (existing) {
      throw new BadRequestException('Ya existe un acuerdo de conciliación para este caso (relación 1:1)');
    }

    return this.prisma.conciliationAgreement.create({
      data: {
        caseId,
        topic: dto.topic,
        agreedAmountBs: dto.agreedAmountBs,
        agreementContent: dto.agreementContent,
        isSignedByParties: dto.isSignedByParties ?? false,
        submittedToCourtAt: dto.submittedToCourtAt ? new Date(dto.submittedToCourtAt) : null,
        courtApprovedAt: dto.courtApprovedAt ? new Date(dto.courtApprovedAt) : null,
        homologationCode: dto.homologationCode,
      },
    });
  }

  async findByCaseId(caseId: string) {
    return this.prisma.conciliationAgreement.findUnique({ where: { caseId } });
  }

  async updateByCaseId(caseId: string, dto: UpdateConciliationAgreementDto, user: AccessUser) {
    await this.caseAccessService.assertUserHasAccess(caseId, user);

    const existing = await this.prisma.conciliationAgreement.findUnique({ where: { caseId } });
    if (!existing) {
      throw new NotFoundException('No existe un acuerdo de conciliación para este caso');
    }

    return this.prisma.conciliationAgreement.update({
      where: { caseId },
      data: {
        ...(dto.topic !== undefined && { topic: dto.topic }),
        ...(dto.agreedAmountBs !== undefined && { agreedAmountBs: dto.agreedAmountBs }),
        ...(dto.agreementContent !== undefined && { agreementContent: dto.agreementContent }),
        ...(dto.isSignedByParties !== undefined && { isSignedByParties: dto.isSignedByParties }),
        ...(dto.submittedToCourtAt !== undefined && {
          submittedToCourtAt: dto.submittedToCourtAt ? new Date(dto.submittedToCourtAt) : null,
        }),
        ...(dto.courtApprovedAt !== undefined && {
          courtApprovedAt: dto.courtApprovedAt ? new Date(dto.courtApprovedAt) : null,
        }),
        ...(dto.homologationCode !== undefined && { homologationCode: dto.homologationCode }),
      },
    });
  }
}
