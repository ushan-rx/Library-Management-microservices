import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MetricsInterceptor } from '../../shared/observability/metrics.interceptor';
import { MetricsService } from '../../shared/observability/metrics.service';
import { BookController } from './books/book.controller';
import { BOOK_REPOSITORY } from './books/book.repository';
import { BookService } from './books/book.service';
import { InMemoryBookRepository } from './books/in-memory-book.repository';
import { PrismaBookRepository } from './books/prisma-book.repository';
import { CategoryClient } from './integrations/category.client';
import { MetricsController } from './metrics/metrics.controller';
import { RolesGuard } from './platform/roles/roles.guard';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
  ],
  controllers: [BookController, MetricsController],
  providers: [
    BookService,
    RolesGuard,
    MetricsInterceptor,
    MetricsService,
    PrismaService,
    CategoryClient,
    InMemoryBookRepository,
    PrismaBookRepository,
    {
      provide: BOOK_REPOSITORY,
      inject: [ConfigService, InMemoryBookRepository, PrismaBookRepository],
      useFactory: (
        configService: ConfigService,
        inMemoryBookRepository: InMemoryBookRepository,
        prismaBookRepository: PrismaBookRepository,
      ) => {
        const storageDriver =
          configService.get<string>('BOOK_STORAGE_DRIVER') ??
          (configService.get<string>('NODE_ENV') === 'test'
            ? 'memory'
            : 'prisma');

        return storageDriver === 'memory'
          ? inMemoryBookRepository
          : prismaBookRepository;
      },
    },
  ],
})
export class BookServiceModule {}
