import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SecurityTokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async activate(userId: string, passwordConfirm: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    const isPasswordValid = await bcrypt.compare(passwordConfirm, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta. Re-autenticación fallida.');
    }

    // Generate short-lived Security Token (15m TTL) with clinical & evidence read scopes
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'SECURITY_TOKEN',
      scopes: ['evidence:read', 'clinical:read'],
    };

    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Log security token activation event in AuditLog
    await this.auditService.logEvent({
      userId: user.id,
      userRole: user.role,
      action: 'SECURITY_TOKEN_ACTIVATE',
      entityType: 'User',
      entityId: user.id,
      details: { scopes: ['evidence:read', 'clinical:read'], ttl: '15m' },
    });

    return {
      securityToken: token,
      expiresInSeconds: 900, // 15 minutes
      scopes: ['evidence:read', 'clinical:read'],
    };
  }
}
