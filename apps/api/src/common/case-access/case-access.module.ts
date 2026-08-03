import { Module, Global } from '@nestjs/common';
import { CaseAccessService } from './case-access.service';
import { CaseAccessGuard } from './case-access.guard';
import { PrismaModule } from '../../modules/prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [CaseAccessService, CaseAccessGuard],
  exports: [CaseAccessService, CaseAccessGuard],
})
export class CaseAccessModule {}
