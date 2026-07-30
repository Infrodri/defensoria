import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { MinioModule } from './modules/minio/minio.module';
import { AuthModule } from './modules/auth/auth.module';
import { SecurityTokenModule } from './modules/security-token/security-token.module';
import { PersonsModule } from './modules/persons/persons.module';
import { CasesModule } from './modules/cases/cases.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ActionLogsModule } from './modules/action-logs/action-logs.module';
import { ReportsModule } from './modules/reports/reports.module';
import { EvidencesModule } from './modules/evidences/evidences.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    MinioModule,
    AuditModule,
    AuthModule,
    SecurityTokenModule,
    PersonsModule,
    CasesModule,
    AppointmentsModule,
    ActionLogsModule,
    ReportsModule,
    EvidencesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
