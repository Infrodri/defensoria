import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PersonsModule } from './modules/persons/persons.module';
import { CasesModule } from './modules/cases/cases.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ActionLogsModule } from './modules/action-logs/action-logs.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    PersonsModule,
    CasesModule,
    AppointmentsModule,
    ActionLogsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
