import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortalAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async loginPortal(caseCode: string, pin: string) {
    const formattedCode = (caseCode || '').toString().trim().toUpperCase();
    const cleanPin = (pin || '').toString().trim();

    console.log(`🔑 Portal Login Attempt: code="${formattedCode}", pin="${cleanPin}"`);

    const caseItem = await this.prisma.case.findUnique({
      where: { caseCode: formattedCode },
    });

    if (!caseItem) {
      console.warn(`❌ Case not found: "${formattedCode}"`);
      throw new NotFoundException('Expediente no encontrado');
    }

    if (!caseItem.accessPinHash) {
      console.warn(`❌ Case has no PIN generated: "${formattedCode}"`);
      throw new UnauthorizedException('El expediente no tiene un PIN de acceso generado. Contacte a la Defensoría.');
    }

    const isPinValid = await bcrypt.compare(cleanPin, caseItem.accessPinHash);

    if (!isPinValid) {
      console.warn(`❌ Invalid PIN for case "${formattedCode}"`);
      throw new UnauthorizedException('PIN de acceso incorrecto');
    }

    const payload = {
      sub: caseItem.id,
      caseCode: caseItem.caseCode,
      isPortal: true,
      role: 'REFERENTE_TUTOR',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      caseCode: caseItem.caseCode,
    };
  }
}
