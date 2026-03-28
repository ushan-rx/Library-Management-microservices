import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from '../platform/roles/roles.decorator';
import { BookRole } from '../platform/roles/book-role.enum';
import { RolesGuard } from '../platform/roles/roles.guard';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { InventoryAdjustDto } from './dto/inventory-adjust.dto';
import { ListBooksQueryDto } from './dto/list-books.query.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
@ApiTags('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get book-service health status' })
  health() {
    return this.bookService.health();
  }

  @Get(':bookId/availability')
  @ApiOperation({ summary: 'Check whether a book is available to borrow' })
  availability(@Param('bookId') bookId: string) {
    return this.bookService.availability(bookId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(BookRole.ADMIN, BookRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Create a new book record' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'List books with optional filters' })
  list(@Query() query: ListBooksQueryDto) {
    return this.bookService.list(query);
  }

  @Get(':bookId')
  @ApiOperation({ summary: 'Get a book by id' })
  getById(@Param('bookId') bookId: string) {
    return this.bookService.getById(bookId);
  }

  @Put(':bookId')
  @UseGuards(RolesGuard)
  @Roles(BookRole.ADMIN, BookRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Update a book by id' })
  update(
    @Param('bookId') bookId: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.bookService.update(bookId, updateBookDto);
  }

  @Delete(':bookId')
  @UseGuards(RolesGuard)
  @Roles(BookRole.ADMIN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Deactivate a book by id' })
  remove(@Param('bookId') bookId: string) {
    return this.bookService.remove(bookId);
  }

  @Post(':bookId/inventory/decrement')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(BookRole.ADMIN, BookRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Decrease available book copies' })
  decrementInventory(
    @Param('bookId') bookId: string,
    @Body() inventoryAdjustDto: InventoryAdjustDto,
  ) {
    return this.bookService.decrementInventory(bookId, inventoryAdjustDto);
  }

  @Post(':bookId/inventory/increment')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(BookRole.ADMIN, BookRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Increase available book copies' })
  incrementInventory(
    @Param('bookId') bookId: string,
    @Body() inventoryAdjustDto: InventoryAdjustDto,
  ) {
    return this.bookService.incrementInventory(bookId, inventoryAdjustDto);
  }
}
