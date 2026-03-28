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
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from '../platform/roles/roles.decorator';
import { CategoryRole } from '../platform/roles/category-role.enum';
import { RolesGuard } from '../platform/roles/roles.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories.query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@ApiTags('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get category-service health status' })
  health() {
    return this.categoryService.health();
  }

  @Get(':categoryId/existence')
  @ApiOperation({ summary: 'Check whether a category exists and is active' })
  existence(@Param('categoryId') categoryId: string) {
    return this.categoryService.existence(categoryId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(CategoryRole.ADMIN, CategoryRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Create a new category' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'List categories with optional filters' })
  list(@Query() query: ListCategoriesQueryDto) {
    return this.categoryService.list(query);
  }

  @Get(':categoryId')
  @ApiOperation({ summary: 'Get a category by id' })
  getById(@Param('categoryId') categoryId: string) {
    return this.categoryService.getById(categoryId);
  }

  @Put(':categoryId')
  @UseGuards(RolesGuard)
  @Roles(CategoryRole.ADMIN, CategoryRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Update a category by id' })
  update(
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(categoryId, updateCategoryDto);
  }

  @Delete(':categoryId')
  @UseGuards(RolesGuard)
  @Roles(CategoryRole.ADMIN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Deactivate a category by id' })
  remove(@Param('categoryId') categoryId: string) {
    return this.categoryService.remove(categoryId);
  }
}
