import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService, AccessUser } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        officeId: true,
        disciplineId: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        officeId: true,
        disciplineId: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async create(dto: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: Role;
    officeId?: string;
    disciplineId?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('Ya existe un usuario con ese email');
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: dto.passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        officeId: dto.officeId ?? null,
        disciplineId: dto.disciplineId ?? null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        officeId: true,
        disciplineId: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, dto: Partial<{
    firstName: string;
    lastName: string;
    role: Role;
    officeId: string | null;
    disciplineId: string | null;
    isActive: boolean;
  }>) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        officeId: true,
        disciplineId: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'Usuario eliminado' };
  }
}