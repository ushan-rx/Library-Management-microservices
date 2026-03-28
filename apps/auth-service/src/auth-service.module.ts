import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { resolveConfigValue } from '../../shared/config/runtime-config.util';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { PasswordService } from './auth/password.service';
import { PrismaService } from './prisma/prisma.service';
import { AUTH_USER_REPOSITORY } from './users/auth-user.repository';
import { InMemoryAuthUserRepository } from './users/in-memory-auth-user.repository';
import { PrismaAuthUserRepository } from './users/prisma-auth-user.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          resolveConfigValue(
            configService,
            'JWT_SECRET',
            'change-me-in-local-env',
          ) ?? 'change-me-in-local-env',
        signOptions: {
          expiresIn:
            resolveConfigValue(configService, 'JWT_EXPIRES_IN', '1h') ?? '1h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    PasswordService,
    PrismaService,
    InMemoryAuthUserRepository,
    PrismaAuthUserRepository,
    {
      provide: AUTH_USER_REPOSITORY,
      inject: [
        ConfigService,
        InMemoryAuthUserRepository,
        PrismaAuthUserRepository,
      ],
      useFactory: (
        configService: ConfigService,
        inMemoryAuthUserRepository: InMemoryAuthUserRepository,
        prismaAuthUserRepository: PrismaAuthUserRepository,
      ) => {
        const storageDriver =
          configService.get<string>('AUTH_STORAGE_DRIVER') ??
          (configService.get<string>('NODE_ENV') === 'test'
            ? 'memory'
            : 'prisma');

        return storageDriver === 'memory'
          ? inMemoryAuthUserRepository
          : prismaAuthUserRepository;
      },
    },
  ],
})
export class AuthServiceModule {}
