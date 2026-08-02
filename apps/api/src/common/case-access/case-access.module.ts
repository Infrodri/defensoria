import { Module, Global } from '@nestjs/common';
import { CaseAccessService } from './case-access.service';
import { PrismaModule } from '../../modules/prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [CaseAccessService],
  exports: [CaseAccessService],
})
export class CaseAccessModule {}
