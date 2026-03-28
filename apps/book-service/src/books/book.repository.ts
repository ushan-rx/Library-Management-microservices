import { CreateBookDto } from './dto/create-book.dto';
import { InventoryAdjustDto } from './dto/inventory-adjust.dto';
import { ListBooksQueryDto } from './dto/list-books.query.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InventoryAdjustmentType } from './enums/inventory-adjustment-type.enum';
import { Book } from './interfaces/book.interface';
import { BookInventoryAdjustment } from './interfaces/book-inventory-adjustment.interface';

export const BOOK_REPOSITORY = Symbol('BOOK_REPOSITORY');

export interface PaginatedBooks {
  items: Book[];
  totalItems: number;
}

export interface InventoryAdjustmentResult {
  book: Book;
  adjustment: BookInventoryAdjustment;
}

export interface BookRepository {
  create(createBookDto: CreateBookDto): Promise<Book>;
  list(query: ListBooksQueryDto): Promise<PaginatedBooks>;
  findById(id: string): Promise<Book | null>;
  findByIdIncludingDeleted(id: string): Promise<Book | null>;
  findByIsbn(isbn: string): Promise<Book | null>;
  update(id: string, updateBookDto: UpdateBookDto): Promise<Book>;
  softDelete(id: string): Promise<Book>;
  adjustInventory(
    id: string,
    adjustmentType: InventoryAdjustmentType,
    adjustDto: InventoryAdjustDto,
  ): Promise<InventoryAdjustmentResult>;
}
