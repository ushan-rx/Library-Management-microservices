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
import { Roles } from '../platform/roles/roles.decorator';
import { BookRole } from '../platform/roles/book-role.enum';
import { RolesGuard } from '../platform/roles/roles.guard';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { InventoryAdjustDto } from './dto/inventory-adjust.dto';
import { ListBooksQueryDto } from './dto/list-books.query.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get('health')
  health() {
    return this.bookService.health();
  }

  @Get(':bookId/availability')
  availability(@Param('bookId') bookId: string) {
    return this.bookService.availability(bookId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(BookRole.ADMIN, BookRole.LIBRARIAN)
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()
  list(@Query() query: ListBooksQueryDto) {
    return this.bookService.list(query);
  }

  @Get(':bookId')
  getById(@Param('bookId') bookId: string) {
    return this.bookService.getById(bookId);
  }

  @Put(':bookId')
  @UseGuards(RolesGuard)
  @Roles(BookRole.ADMIN, BookRole.LIBRARIAN)
  update(
    @Param('bookId') bookId: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.bookService.update(bookId, updateBookDto);
  }

  @Delete(':bookId')
  @UseGuards(RolesGuard)
  @Roles(BookRole.ADMIN)
  remove(@Param('bookId') bookId: string) {
    return this.bookService.remove(bookId);
  }

  @Post(':bookId/inventory/decrement')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(BookRole.ADMIN, BookRole.LIBRARIAN)
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
  incrementInventory(
    @Param('bookId') bookId: string,
    @Body() inventoryAdjustDto: InventoryAdjustDto,
  ) {
    return this.bookService.incrementInventory(bookId, inventoryAdjustDto);
  }
}
