import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(take = 100) {
    const logs = await this.prisma.auditLog.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    });

    return logs.map((log) => ({
      ...log,
      id: log.id.toString(), // Convert BigInt to string for JSON serialization
    }));
  }

  async logEvent(data: {
    userId: string;
    userRole: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: any;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        userRole: data.userRole,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details || null,
        ipAddress: data.ipAddress || null,
      },
    });
  }
}
