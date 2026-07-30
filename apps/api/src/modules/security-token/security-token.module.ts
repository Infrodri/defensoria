import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SecurityTokenService } from './security-token.service';
import { SecurityTokenController } from './security-token.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defensoria_dev_jwt_secret_key_change_me',
    }),
  ],
  controllers: [SecurityTokenController],
  providers: [SecurityTokenService],
  exports: [SecurityTokenService],
})
export class SecurityTokenModule {}
