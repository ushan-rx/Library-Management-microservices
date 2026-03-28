import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BorrowController } from './borrows/borrow.controller';
import { BORROW_REPOSITORY } from './borrows/borrow.repository';
import { BorrowService } from './borrows/borrow.service';
import { InMemoryBorrowRepository } from './borrows/in-memory-borrow.repository';
import { PrismaBorrowRepository } from './borrows/prisma-borrow.repository';
import { BookClient } from './integrations/book.client';
import { FineClient } from './integrations/fine.client';
import { MemberClient } from './integrations/member.client';
import { RolesGuard } from './platform/roles/roles.guard';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
  ],
  controllers: [BorrowController],
  providers: [
    BorrowService,
    RolesGuard,
    PrismaService,
    MemberClient,
    BookClient,
    FineClient,
    InMemoryBorrowRepository,
    PrismaBorrowRepository,
    {
      provide: BORROW_REPOSITORY,
      inject: [ConfigService, InMemoryBorrowRepository, PrismaBorrowRepository],
      useFactory: (
        configService: ConfigService,
        inMemoryBorrowRepository: InMemoryBorrowRepository,
        prismaBorrowRepository: PrismaBorrowRepository,
      ) => {
        const storageDriver =
          configService.get<string>('BORROW_STORAGE_DRIVER') ??
          (configService.get<string>('NODE_ENV') === 'test'
            ? 'memory'
            : 'prisma');

        return storageDriver === 'memory'
          ? inMemoryBorrowRepository
          : prismaBorrowRepository;
      },
    },
  ],
})
export class BorrowServiceModule {}
