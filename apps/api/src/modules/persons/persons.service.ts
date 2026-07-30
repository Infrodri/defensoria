import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType, Gender } from '@defensoria/shared';

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
  constructor(private prisma: PrismaService) {}

  async search(query: string) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Ingrese al menos 2 caracteres para la búsqueda');
    }

    const cleanQuery = query.trim();

    return this.prisma.person.findMany({
      where: {
        OR: [
          { documentNumber: { contains: cleanQuery, mode: 'insensitive' } },
          { firstName: { contains: cleanQuery, mode: 'insensitive' } },
          { lastName: { contains: cleanQuery, mode: 'insensitive' } },
        ],
      },
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

    return this.prisma.person.create({
      data: {
        documentType: dto.documentType || DocumentType.SIN_DOCUMENTO,
        documentNumber: dto.documentNumber || null,
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
