import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateBookDto } from './dto/create-book.dto';
import { InventoryAdjustDto } from './dto/inventory-adjust.dto';
import { ListBooksQueryDto } from './dto/list-books.query.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookStatus } from './enums/book-status.enum';
import { InventoryAdjustmentType } from './enums/inventory-adjustment-type.enum';
import {
  BookRepository,
  InventoryAdjustmentResult,
  PaginatedBooks,
} from './book.repository';
import { Book } from './interfaces/book.interface';
import { BookInventoryAdjustment } from './interfaces/book-inventory-adjustment.interface';

@Injectable()
export class InMemoryBookRepository implements BookRepository {
  private readonly books = new Map<string, Book>();
  private readonly adjustments = new Map<string, BookInventoryAdjustment[]>();

  create(createBookDto: CreateBookDto): Promise<Book> {
    const now = new Date();
    const book: Book = {
      id: randomUUID(),
      title: createBookDto.title,
      author: createBookDto.author,
      isbn: createBookDto.isbn ?? null,
      publishedYear: createBookDto.publishedYear ?? null,
      categoryId: createBookDto.categoryId,
      totalCopies: createBookDto.totalCopies,
      availableCopies: createBookDto.availableCopies,
      status: createBookDto.status,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.books.set(book.id, book);

    return Promise.resolve(book);
  }

  list(query: ListBooksQueryDto): Promise<PaginatedBooks> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim().toLowerCase();

    const items = [...this.books.values()]
      .filter((book) => book.deletedAt === null)
      .filter((book) =>
        query.categoryId ? book.categoryId === query.categoryId : true,
      )
      .filter((book) => (query.status ? book.status === query.status : true))
      .filter((book) =>
        query.availableOnly
          ? book.status === BookStatus.ACTIVE && book.availableCopies > 0
          : true,
      )
      .filter((book) => {
        if (!search) {
          return true;
        }

        return [book.title, book.author, book.isbn ?? ''].some((value) =>
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

  findById(id: string): Promise<Book | null> {
    const book = this.books.get(id);
    if (!book || book.deletedAt !== null) {
      return Promise.resolve(null);
    }

    return Promise.resolve(book);
  }

  findByIdIncludingDeleted(id: string): Promise<Book | null> {
    return Promise.resolve(this.books.get(id) ?? null);
  }

  findByIsbn(isbn: string): Promise<Book | null> {
    for (const book of this.books.values()) {
      if (book.deletedAt !== null || !book.isbn) {
        continue;
      }

      if (book.isbn === isbn) {
        return Promise.resolve(book);
      }
    }

    return Promise.resolve(null);
  }

  update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const existingBook = this.books.get(id);
    if (!existingBook) {
      throw new Error(`Book ${id} not found`);
    }

    const updatedBook: Book = {
      ...existingBook,
      title: updateBookDto.title ?? existingBook.title,
      author: updateBookDto.author ?? existingBook.author,
      isbn:
        updateBookDto.isbn === undefined
          ? existingBook.isbn
          : (updateBookDto.isbn ?? null),
      publishedYear:
        updateBookDto.publishedYear === undefined
          ? existingBook.publishedYear
          : (updateBookDto.publishedYear ?? null),
      categoryId: updateBookDto.categoryId ?? existingBook.categoryId,
      totalCopies: updateBookDto.totalCopies ?? existingBook.totalCopies,
      availableCopies:
        updateBookDto.availableCopies ?? existingBook.availableCopies,
      status: updateBookDto.status ?? existingBook.status,
      updatedAt: new Date(),
    };

    this.books.set(id, updatedBook);

    return Promise.resolve(updatedBook);
  }

  softDelete(id: string): Promise<Book> {
    const existingBook = this.books.get(id);
    if (!existingBook) {
      throw new Error(`Book ${id} not found`);
    }

    const deletedBook: Book = {
      ...existingBook,
      status: BookStatus.INACTIVE,
      deletedAt: new Date(),
      updatedAt: new Date(),
    };

    this.books.set(id, deletedBook);

    return Promise.resolve(deletedBook);
  }

  adjustInventory(
    id: string,
    adjustmentType: InventoryAdjustmentType,
    adjustDto: InventoryAdjustDto,
  ): Promise<InventoryAdjustmentResult> {
    const existingBook = this.books.get(id);
    if (!existingBook) {
      throw new Error(`Book ${id} not found`);
    }

    const nextAvailableCopies =
      adjustmentType === InventoryAdjustmentType.DECREMENT
        ? existingBook.availableCopies - adjustDto.quantity
        : existingBook.availableCopies + adjustDto.quantity;

    const updatedBook: Book = {
      ...existingBook,
      availableCopies: nextAvailableCopies,
      updatedAt: new Date(),
    };

    const adjustment: BookInventoryAdjustment = {
      id: randomUUID(),
      bookId: id,
      adjustmentType,
      quantity: adjustDto.quantity,
      reason: adjustDto.reason,
      referenceId: adjustDto.referenceId ?? null,
      createdAt: new Date(),
    };

    this.books.set(id, updatedBook);
    const currentAdjustments = this.adjustments.get(id) ?? [];
    this.adjustments.set(id, [...currentAdjustments, adjustment]);

    return Promise.resolve({
      book: updatedBook,
      adjustment,
    });
  }
}
