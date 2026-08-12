import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType, Gender } from '@defensoria/shared';

export function normalizeDocumentNumber(doc: string): string {
  if (!doc) return '';
  return doc
    .trim()
    .replace(/[\s-]*(LP|SC|CB|OR|PT|TJ|BE|PD|CH)$/i, '')
    .replace(/\./g, '')
    .replace(/\D/g, '');
}

export interface CreatePersonDto {
  documentType: DocumentType;
  documentNumber?: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender: Gender;
  phone?: string;
  address?: string;
  notes?: string;
}

@Injectable()
export class PersonsService {
  private readonly logger = new Logger(PersonsService.name);

  constructor(private prisma: PrismaService) {}

  async search(query: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cleanQuery = query.trim();
    const terms = cleanQuery.split(/\s+/).filter(Boolean);

    const baseWhere = {
      OR: [
        { documentNumber: { contains: cleanQuery, mode: 'insensitive' as const } },
        { firstName: { contains: cleanQuery, mode: 'insensitive' as const } },
        { lastName: { contains: cleanQuery, mode: 'insensitive' as const } },
        ...(terms.length > 1
          ? [
              {
                AND: terms.map((term) => ({
                  OR: [
                    { firstName: { contains: term, mode: 'insensitive' as const } },
                    { lastName: { contains: term, mode: 'insensitive' as const } },
                    { documentNumber: { contains: term, mode: 'insensitive' as const } },
                  ],
                })),
              },
            ]
          : []),
      ],
    };

    return this.prisma.person.findMany({
      where: baseWhere,
      include: {
        caseParties: {
          include: {
            case: {
              select: {
                id: true,
                caseCode: true,
                caseType: true,
                currentPhase: true,
                createdAt: true,
              },
            },
          },
        },
      },
      take: 20,
    });
  }

  async create(dto: CreatePersonDto, userId: string) {
    if (!dto.firstName || !dto.lastName) {
      throw new BadRequestException('El nombre y apellido son requeridos');
    }

    if (dto.documentNumber && dto.documentNumber.trim() !== '') {
      const normalizedDoc = normalizeDocumentNumber(dto.documentNumber);
      if (normalizedDoc) {
        let existingPerson = await this.prisma.person.findFirst({
          where: { documentNumber: normalizedDoc },
        });

        if (!existingPerson && dto.documentNumber.trim() !== normalizedDoc) {
          existingPerson = await this.prisma.person.findFirst({
            where: { documentNumber: dto.documentNumber.trim() },
          });
        }

        if (!existingPerson) {
          const candidates = await this.prisma.person.findMany({
            where: { documentNumber: { not: null } },
          });
          existingPerson = candidates.find(
            (p) => p.documentNumber && normalizeDocumentNumber(p.documentNumber) === normalizedDoc,
          ) || null;
        }

        if (existingPerson) {
          this.logger.log(`Person reused: existing match by document ${dto.documentNumber} (id=${existingPerson.id})`);
          return existingPerson;
        }
      }
    }

    return this.prisma.person.create({
      data: {
        documentType: dto.documentType || DocumentType.SIN_DOCUMENTO,
        documentNumber: dto.documentNumber ? normalizeDocumentNumber(dto.documentNumber) || dto.documentNumber.trim() : null,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        gender: dto.gender || Gender.OTRO,
        phone: dto.phone || null,
        address: dto.address || null,
        notes: dto.notes || null,
        createdBy: userId,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.person.findUnique({
      where: { id },
      include: {
        caseParties: {
          include: {
            case: true,
          },
        },
      },
    });
  }
}
