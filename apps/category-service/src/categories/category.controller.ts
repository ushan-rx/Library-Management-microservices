import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../platform/roles/roles.decorator';
import { CategoryRole } from '../platform/roles/category-role.enum';
import { RolesGuard } from '../platform/roles/roles.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories.query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('health')
  health() {
    return this.categoryService.health();
  }

  @Get(':categoryId/existence')
  existence(@Param('categoryId') categoryId: string) {
    return this.categoryService.existence(categoryId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(CategoryRole.ADMIN, CategoryRole.LIBRARIAN)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  list(@Query() query: ListCategoriesQueryDto) {
    return this.categoryService.list(query);
  }

  @Get(':categoryId')
  getById(@Param('categoryId') categoryId: string) {
    return this.categoryService.getById(categoryId);
  }

  @Put(':categoryId')
  @UseGuards(RolesGuard)
  @Roles(CategoryRole.ADMIN, CategoryRole.LIBRARIAN)
  update(
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(categoryId, updateCategoryDto);
  }

  @Delete(':categoryId')
  @UseGuards(RolesGuard)
  @Roles(CategoryRole.ADMIN)
  remove(@Param('categoryId') categoryId: string) {
    return this.categoryService.remove(categoryId);
  }
}
