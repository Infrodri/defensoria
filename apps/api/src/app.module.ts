import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PersonsModule } from './modules/persons/persons.module';
import { CasesModule } from './modules/cases/cases.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    PersonsModule,
    CasesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
