import { Injectable } from '@nestjs/common';
import {
  Prisma,
  CategoryStatus as PrismaCategoryStatus,
} from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories.query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryStatus } from './enums/category-status.enum';
import { Category } from './interfaces/category.interface';
import { CategoryRepository, PaginatedCategories } from './category.repository';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = await this.prismaService.category.create({
      data: {
        name: createCategoryDto.name,
        description: createCategoryDto.description ?? null,
        status: PrismaCategoryStatus.ACTIVE,
      },
    });

    return this.toDomainCategory(category);
  }

  async list(query: ListCategoriesQueryDto): Promise<PaginatedCategories> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
      ...(query.status
        ? {
            status: this.toPrismaStatus(query.status),
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                name: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, totalItems] = await this.prismaService.$transaction([
      this.prismaService.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.category.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toDomainCategory(item)),
      totalItems,
    };
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prismaService.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    return category ? this.toDomainCategory(category) : null;
  }

  async findByIdIncludingDeleted(id: string): Promise<Category | null> {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    return category ? this.toDomainCategory(category) : null;
  }

  async findActiveByName(name: string): Promise<Category | null> {
    const category = await this.prismaService.category.findFirst({
      where: {
        deletedAt: null,
        status: PrismaCategoryStatus.ACTIVE,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    return category ? this.toDomainCategory(category) : null;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.prismaService.category.update({
      where: { id },
      data: {
        ...(updateCategoryDto.name !== undefined
          ? { name: updateCategoryDto.name }
          : {}),
        ...(updateCategoryDto.description !== undefined
          ? { description: updateCategoryDto.description ?? null }
          : {}),
        ...(updateCategoryDto.status !== undefined
          ? { status: this.toPrismaStatus(updateCategoryDto.status) }
          : {}),
      },
    });

    return this.toDomainCategory(category);
  }

  async softDelete(id: string): Promise<Category> {
    const category = await this.prismaService.category.update({
      where: { id },
      data: {
        status: PrismaCategoryStatus.INACTIVE,
        deletedAt: new Date(),
      },
    });

    return this.toDomainCategory(category);
  }

  private toDomainCategory(category: {
    id: string;
    name: string;
    description: string | null;
    status: PrismaCategoryStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Category {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      status: this.toDomainStatus(category.status),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      deletedAt: category.deletedAt,
    };
  }

  private toPrismaStatus(status: CategoryStatus): PrismaCategoryStatus {
    return status as PrismaCategoryStatus;
  }

  private toDomainStatus(status: PrismaCategoryStatus): CategoryStatus {
    return status as CategoryStatus;
  }
}
