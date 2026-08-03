import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@defensoria/shared';

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  officeId: string;
  password?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: Role;
  officeId?: string;
  isActive?: boolean;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async listProfessionals(roleFilter?: Role) {
    const professionalRoles = [Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL];
    
    const where: any = {
      isActive: true,
      role: {
        in: roleFilter ? [roleFilter] : professionalRoles,
      },
    };

    const professionals = await this.prisma.user.findMany({
      where,
      orderBy: [
        { role: 'asc' },
        { lastName: 'asc' },
      ],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        email: true,
        officeId: true,
        isActive: true,
        office: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return professionals;
  }

  async findAll(filters?: { role?: Role; isActive?: boolean }) {
    const where: any = {};
    
    if (filters?.role) {
      where.role = filters.role;
    }
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: [
        { role: 'asc' },
        { lastName: 'asc' },
      ],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        officeId: true,
        createdAt: true,
        office: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
          },
        },
        _count: {
          select: {
            assignedCaseTeam: {
              where: { endDate: null },
            },
          },
        },
      },
    });

    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        officeId: true,
        createdAt: true,
        office: true,
        assignedCaseTeam: {
          where: { endDate: null },
          include: {
            case: {
              select: {
                id: true,
                caseCode: true,
                caseType: true,
                currentPhase: true,
                riskLevel: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException(`El correo ${dto.email} ya está registrado`);
    }

    const defaultPassword = dto.password || 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        officeId: dto.officeId,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        officeId: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.role && { role: dto.role }),
        ...(dto.officeId && { officeId: dto.officeId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        officeId: true,
        updatedAt: true,
      },
    });
  }

  async resetPassword(id: string, newPassword?: string) {
    await this.findOne(id);

    const passwordToSet = newPassword || 'Password123!';
    const passwordHash = await bcrypt.hash(passwordToSet, 10);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return { message: 'Contraseña restablecida correctamente', defaultPassword: passwordToSet };
  }
}
