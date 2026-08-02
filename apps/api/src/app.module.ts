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
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { PortalAuthModule } from './modules/portal-auth/portal-auth.module';
import { PortalModule } from './modules/portal/portal.module';
import { InspectionsModule } from './modules/inspections/inspections.module';
import { OfficesModule } from './modules/offices/offices.module';
import { UsersModule } from './modules/users/users.module';
import { SystemModulesModule } from './modules/system-modules/system-modules.module';
import { DisciplinesModule } from './modules/disciplines/disciplines.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { InstrumentsModule } from './modules/instruments/instruments.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { AiConfigModule } from './modules/ai-config/ai-config.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { SystemBackupModule } from './modules/system-backup/system-backup.module';
import { QuestionnairesModule } from './modules/questionnaires/questionnaires.module';
import { LegalToolsModule } from './modules/legal-tools/legal-tools.module';

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
    AiAssistantModule,
    TimelineModule,
    PortalAuthModule,
    PortalModule,
    InspectionsModule,
    OfficesModule,
    UsersModule,
    SystemModulesModule,
    DisciplinesModule,
    TemplatesModule,
    InstrumentsModule,
    KnowledgeModule,
    AiConfigModule,
    CatalogsModule,
    SystemBackupModule,
    QuestionnairesModule,
    LegalToolsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
