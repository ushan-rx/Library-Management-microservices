import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories.query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryStatus } from './enums/category-status.enum';
import { Category } from './interfaces/category.interface';
import { CategoryRepository, PaginatedCategories } from './category.repository';

@Injectable()
export class InMemoryCategoryRepository implements CategoryRepository {
  private readonly categories = new Map<string, Category>();

  create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const now = new Date();
    const category: Category = {
      id: randomUUID(),
      name: createCategoryDto.name,
      description: createCategoryDto.description ?? null,
      status: CategoryStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.categories.set(category.id, category);

    return Promise.resolve(category);
  }

  list(query: ListCategoriesQueryDto): Promise<PaginatedCategories> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim().toLowerCase();

    const items = [...this.categories.values()]
      .filter((category) => category.deletedAt === null)
      .filter((category) => {
        if (!query.status) {
          return true;
        }

        return category.status === query.status;
      })
      .filter((category) => {
        if (!search) {
          return true;
        }

        return [category.name, category.description ?? ''].some((value) =>
          value.toLowerCase().includes(search),
        );
      })
      .sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
      );

    const totalItems = items.length;
    const offset = (page - 1) * limit;

    return Promise.resolve({
      items: items.slice(offset, offset + limit),
      totalItems,
    });
  }

  findById(id: string): Promise<Category | null> {
    const category = this.categories.get(id);

    if (!category || category.deletedAt !== null) {
      return Promise.resolve(null);
    }

    return Promise.resolve(category);
  }

  findByIdIncludingDeleted(id: string): Promise<Category | null> {
    return Promise.resolve(this.categories.get(id) ?? null);
  }

  findActiveByName(name: string): Promise<Category | null> {
    const normalizedName = name.trim().toLowerCase();

    for (const category of this.categories.values()) {
      if (
        category.deletedAt === null &&
        category.status === CategoryStatus.ACTIVE &&
        category.name.trim().toLowerCase() === normalizedName
      ) {
        return Promise.resolve(category);
      }
    }

    return Promise.resolve(null);
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) {
      throw new Error(`Category ${id} not found`);
    }

    const updatedCategory: Category = {
      ...existingCategory,
      name: updateCategoryDto.name ?? existingCategory.name,
      description:
        updateCategoryDto.description === undefined
          ? existingCategory.description
          : (updateCategoryDto.description ?? null),
      status: updateCategoryDto.status ?? existingCategory.status,
      updatedAt: new Date(),
    };

    this.categories.set(id, updatedCategory);

    return Promise.resolve(updatedCategory);
  }

  softDelete(id: string): Promise<Category> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) {
      throw new Error(`Category ${id} not found`);
    }

    const deletedCategory: Category = {
      ...existingCategory,
      status: CategoryStatus.INACTIVE,
      deletedAt: new Date(),
      updatedAt: new Date(),
    };

    this.categories.set(id, deletedCategory);

    return Promise.resolve(deletedCategory);
  }
}
