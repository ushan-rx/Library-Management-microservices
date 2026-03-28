import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FINE_REPOSITORY } from './fines/fine.repository';
import { FineController } from './fines/fine.controller';
import { FineService } from './fines/fine.service';
import { InMemoryFineRepository } from './fines/in-memory-fine.repository';
import { PrismaFineRepository } from './fines/prisma-fine.repository';
import { RolesGuard } from './platform/roles/roles.guard';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
  ],
  controllers: [FineController],
  providers: [
    FineService,
    RolesGuard,
    PrismaService,
    InMemoryFineRepository,
    PrismaFineRepository,
    {
      provide: FINE_REPOSITORY,
      inject: [ConfigService, InMemoryFineRepository, PrismaFineRepository],
      useFactory: (
        configService: ConfigService,
        inMemoryFineRepository: InMemoryFineRepository,
        prismaFineRepository: PrismaFineRepository,
      ) => {
        const storageDriver =
          configService.get<string>('FINE_STORAGE_DRIVER') ??
          (configService.get<string>('NODE_ENV') === 'test'
            ? 'memory'
            : 'prisma');

        return storageDriver === 'memory'
          ? inMemoryFineRepository
          : prismaFineRepository;
      },
    },
  ],
})
export class FinePaymentServiceModule {}
