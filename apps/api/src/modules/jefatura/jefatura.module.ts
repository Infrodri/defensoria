import { Module } from '@nestjs/common';
import { JefaturaService } from './jefatura.service';
import { JefaturaController } from './jefatura.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessModule } from '../../common/case-access/case-access.module';

@Module({
  imports: [CaseAccessModule],
  providers: [JefaturaService, PrismaService],
  controllers: [JefaturaController],
  exports: [JefaturaService],
})
export class JefaturaModule {}