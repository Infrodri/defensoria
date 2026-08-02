import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  officeId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'defensoria_dev_jwt_secret_key_change_me',
    });
  }

  async validate(payload: JwtPayload & { isPortal?: boolean; caseCode?: string }) {
    if (payload.isPortal) {
      return {
        id: payload.sub,
        sub: payload.sub,
        caseCode: payload.caseCode,
        role: 'REFERENTE_TUTOR',
        isPortal: true,
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        officeId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario inactivo o no autorizado');
    }

    return user;
  }
}
