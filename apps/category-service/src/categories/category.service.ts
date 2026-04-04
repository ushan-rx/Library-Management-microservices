import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  categoryConflict,
  categoryNotFound,
} from '../common/category-response.helpers';
import { CATEGORY_REPOSITORY } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories.query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryStatus } from './enums/category-status.enum';
import { Category } from './interfaces/category.interface';
import type { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    await this.assertActiveNameAvailable(createCategoryDto.name);

    const category = await this.categoryRepository.create(createCategoryDto);
    this.logger.log(`Category created: ${category.id}`);

    return {
      success: true,
      message: 'Category created successfully',
      data: {
        id: category.id,
        name: category.name,
        status: category.status,
      },
    };
  }

  async list(query: ListCategoriesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { items, totalItems } = await this.categoryRepository.list(query);

    return {
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        items: items.map((category) => this.toCategoryResponse(category)),
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit),
        },
      },
    };
  }

  async getById(categoryId: string) {
    const category = await this.requireCategory(categoryId);

    return {
      success: true,
      message: 'Category retrieved successfully',
      data: this.toCategoryResponse(category),
    };
  }

  async update(categoryId: string, updateCategoryDto: UpdateCategoryDto) {
    const existingCategory = await this.requireCategory(categoryId);

    if (
      updateCategoryDto.name &&
      updateCategoryDto.name.trim().toLowerCase() !==
        existingCategory.name.trim().toLowerCase()
    ) {
      await this.assertActiveNameAvailable(updateCategoryDto.name, categoryId);
    }

    const category = await this.categoryRepository.update(
      categoryId,
      updateCategoryDto,
    );
    this.logger.log(`Category updated: ${category.id}`);

    return {
      success: true,
      message: 'Category updated successfully',
      data: this.toCategoryResponse(category),
    };
  }

  async remove(categoryId: string) {
    await this.requireCategory(categoryId);
    const category = await this.categoryRepository.softDelete(categoryId);
    this.logger.log(`Category deactivated: ${category.id}`);

    return {
      success: true,
      message: 'Category deactivated successfully',
      data: {
        id: category.id,
        status: category.status,
        deletedAt: category.deletedAt,
      },
    };
  }

  async existence(categoryId: string) {
    const category =
      await this.categoryRepository.findByIdIncludingDeleted(categoryId);

    return {
      success: true,
      message: 'Category checked successfully',
      data: {
        categoryId,
        exists: category !== null,
        active:
          category !== null &&
          category.deletedAt === null &&
          category.status === CategoryStatus.ACTIVE,
      },
    };
  }

  health() {
    return {
      success: true,
      message: 'Category service healthy',
      data: {
        service: process.env.CATEGORY_SERVICE_NAME ?? 'category-service',
        status: 'UP',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private async requireCategory(categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw categoryNotFound();
    }

    return category;
  }

  private async assertActiveNameAvailable(
    name: string,
    currentCategoryId?: string,
  ) {
    const existingCategory =
      await this.categoryRepository.findActiveByName(name);
    if (existingCategory && existingCategory.id !== currentCategoryId) {
      throw categoryConflict(
        'Category name already exists',
        'CATEGORY_NAME_ALREADY_EXISTS',
      );
    }
  }

  private toCategoryResponse(category: Category) {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      status: category.status,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
