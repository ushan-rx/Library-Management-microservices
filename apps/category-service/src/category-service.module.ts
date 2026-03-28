import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoryController } from './categories/category.controller';
import { CATEGORY_REPOSITORY } from './categories/category.repository';
import { CategoryService } from './categories/category.service';
import { InMemoryCategoryRepository } from './categories/in-memory-category.repository';
import { PrismaCategoryRepository } from './categories/prisma-category.repository';
import { RolesGuard } from './platform/roles/roles.guard';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
  ],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    RolesGuard,
    PrismaService,
    InMemoryCategoryRepository,
    PrismaCategoryRepository,
    {
      provide: CATEGORY_REPOSITORY,
      inject: [
        ConfigService,
        InMemoryCategoryRepository,
        PrismaCategoryRepository,
      ],
      useFactory: (
        configService: ConfigService,
        inMemoryCategoryRepository: InMemoryCategoryRepository,
        prismaCategoryRepository: PrismaCategoryRepository,
      ) => {
        const storageDriver =
          configService.get<string>('CATEGORY_STORAGE_DRIVER') ??
          (configService.get<string>('NODE_ENV') === 'test'
            ? 'memory'
            : 'prisma');

        return storageDriver === 'memory'
          ? inMemoryCategoryRepository
          : prismaCategoryRepository;
      },
    },
  ],
})
export class CategoryServiceModule {}
