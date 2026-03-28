import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories.query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './interfaces/category.interface';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface PaginatedCategories {
  items: Category[];
  totalItems: number;
}

export interface CategoryRepository {
  create(createCategoryDto: CreateCategoryDto): Promise<Category>;
  list(query: ListCategoriesQueryDto): Promise<PaginatedCategories>;
  findById(id: string): Promise<Category | null>;
  findByIdIncludingDeleted(id: string): Promise<Category | null>;
  findActiveByName(name: string): Promise<Category | null>;
  update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
  softDelete(id: string): Promise<Category>;
}
