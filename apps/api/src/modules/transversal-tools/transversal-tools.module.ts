import { Module } from '@nestjs/common';
import { TransversalToolsController } from './transversal-tools.controller';
import { TransversalToolsService } from './transversal-tools.service';
import { PrismaModule } from '../prisma/prisma.module';
// AuditModule is global so we might not need to import it explicitly, but doing so is fine.

@Module({
  imports: [PrismaModule],
  controllers: [TransversalToolsController],
  providers: [TransversalToolsService],
})
export class TransversalToolsModule {}
