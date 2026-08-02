import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PortalAuthService } from './portal-auth.service';
import { PortalAuthController } from './portal-auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'defensoria_dev_jwt_secret_key_change_me',
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  controllers: [PortalAuthController],
  providers: [PortalAuthService],
  exports: [PortalAuthService],
})
export class PortalAuthModule {}
