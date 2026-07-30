import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class RlsContextInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.id) {
      // Execute SET LOCAL app.user_id within PostgreSQL transaction or connection context
      try {
        await this.prisma.$executeRawUnsafe(`SET LOCAL app.user_id = '${user.id}';`);
      } catch (err) {
        // Silently catch if not in transaction context during non-transactional queries
      }
    }

    return next.handle();
  }
}
