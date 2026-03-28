import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  bookBadRequest,
  bookConflict,
  bookNotFound,
} from '../common/book-response.helpers';
import { CategoryClient } from '../integrations/category.client';
import { BOOK_REPOSITORY, BookRepository } from './book.repository';
import { CreateBookDto } from './dto/create-book.dto';
import { InventoryAdjustDto } from './dto/inventory-adjust.dto';
import { ListBooksQueryDto } from './dto/list-books.query.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookStatus } from './enums/book-status.enum';
import { InventoryAdjustmentType } from './enums/inventory-adjustment-type.enum';
import { Book } from './interfaces/book.interface';

@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name);

  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: BookRepository,
    private readonly categoryClient: CategoryClient,
  ) {}

  async create(createBookDto: CreateBookDto) {
    this.assertCopyBounds(
      createBookDto.totalCopies,
      createBookDto.availableCopies,
    );
    await this.assertIsbnAvailable(createBookDto.isbn);
    await this.categoryClient.validateCategory(createBookDto.categoryId);

    const book = await this.bookRepository.create(createBookDto);
    this.logger.log(`Book created: ${book.id}`);

    return {
      success: true,
      message: 'Book created successfully',
      data: {
        id: book.id,
        title: book.title,
        availableCopies: book.availableCopies,
        status: book.status,
      },
    };
  }

  async list(query: ListBooksQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { items, totalItems } = await this.bookRepository.list(query);

    return {
      success: true,
      message: 'Books retrieved successfully',
      data: {
        items: items.map((book) => this.toBookResponse(book)),
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit),
        },
      },
    };
  }

  async getById(bookId: string) {
    const book = await this.requireBook(bookId);

    return {
      success: true,
      message: 'Book retrieved successfully',
      data: this.toBookResponse(book),
    };
  }

  async update(bookId: string, updateBookDto: UpdateBookDto) {
    const existingBook = await this.requireBook(bookId);
    const totalCopies = updateBookDto.totalCopies ?? existingBook.totalCopies;
    const availableCopies =
      updateBookDto.availableCopies ?? existingBook.availableCopies;

    this.assertCopyBounds(totalCopies, availableCopies);

    if (updateBookDto.isbn && updateBookDto.isbn !== existingBook.isbn) {
      await this.assertIsbnAvailable(updateBookDto.isbn, bookId);
    }

    if (
      updateBookDto.categoryId &&
      updateBookDto.categoryId !== existingBook.categoryId
    ) {
      await this.categoryClient.validateCategory(updateBookDto.categoryId);
    }

    const book = await this.bookRepository.update(bookId, updateBookDto);
    this.logger.log(`Book updated: ${book.id}`);

    return {
      success: true,
      message: 'Book updated successfully',
      data: this.toBookResponse(book),
    };
  }

  async remove(bookId: string) {
    await this.requireBook(bookId);
    const book = await this.bookRepository.softDelete(bookId);
    this.logger.log(`Book deactivated: ${book.id}`);

    return {
      success: true,
      message: 'Book deactivated successfully',
      data: {
        id: book.id,
        status: book.status,
        deletedAt: book.deletedAt,
      },
    };
  }

  async availability(bookId: string) {
    const book = await this.bookRepository.findByIdIncludingDeleted(bookId);

    if (!book) {
      return {
        success: true,
        message: 'Book availability checked successfully',
        data: {
          bookId,
          exists: false,
          available: false,
          availableCopies: 0,
          status: null,
        },
      };
    }

    return {
      success: true,
      message: 'Book availability checked successfully',
      data: {
        bookId,
        exists: true,
        available:
          book.deletedAt === null &&
          book.status === BookStatus.ACTIVE &&
          book.availableCopies > 0,
        availableCopies: book.availableCopies,
        status: book.status,
      },
    };
  }

  async decrementInventory(bookId: string, adjustDto: InventoryAdjustDto) {
    const book = await this.requireBook(bookId);

    if (book.status !== BookStatus.ACTIVE || book.availableCopies <= 0) {
      throw bookConflict('Book is not available', 'BOOK_NOT_AVAILABLE');
    }

    if (book.availableCopies < adjustDto.quantity) {
      throw bookConflict('Insufficient available copies', 'BOOK_NOT_AVAILABLE');
    }

    const result = await this.bookRepository.adjustInventory(
      bookId,
      InventoryAdjustmentType.DECREMENT,
      adjustDto,
    );

    this.logger.log(`Book inventory decremented: ${bookId}`);

    return {
      success: true,
      message: 'Book inventory decremented successfully',
      data: {
        bookId,
        availableCopies: result.book.availableCopies,
        adjustment: this.toAdjustmentResponse(result.adjustment),
      },
    };
  }

  async incrementInventory(bookId: string, adjustDto: InventoryAdjustDto) {
    const book = await this.requireBook(bookId);

    if (book.availableCopies + adjustDto.quantity > book.totalCopies) {
      throw bookConflict(
        'Inventory increment exceeds total copies',
        'INVENTORY_LIMIT_EXCEEDED',
      );
    }

    const result = await this.bookRepository.adjustInventory(
      bookId,
      InventoryAdjustmentType.INCREMENT,
      adjustDto,
    );

    this.logger.log(`Book inventory incremented: ${bookId}`);

    return {
      success: true,
      message: 'Book inventory incremented successfully',
      data: {
        bookId,
        availableCopies: result.book.availableCopies,
        adjustment: this.toAdjustmentResponse(result.adjustment),
      },
    };
  }

  health() {
    return {
      success: true,
      message: 'Book service healthy',
      data: {
        service: process.env.BOOK_SERVICE_NAME ?? 'book-service',
        status: 'UP',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private async requireBook(bookId: string): Promise<Book> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw bookNotFound();
    }

    return book;
  }

  private async assertIsbnAvailable(isbn?: string, currentBookId?: string) {
    if (!isbn) {
      return;
    }

    const existingBook = await this.bookRepository.findByIsbn(isbn);
    if (existingBook && existingBook.id !== currentBookId) {
      throw bookConflict('ISBN already exists', 'ISBN_ALREADY_EXISTS');
    }
  }

  private assertCopyBounds(totalCopies: number, availableCopies: number) {
    if (availableCopies > totalCopies) {
      throw bookBadRequest(
        'Available copies cannot exceed total copies',
        'INVALID_COPY_COUNTS',
      );
    }
  }

  private toBookResponse(book: Book) {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
      categoryId: book.categoryId,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      status: book.status,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }

  private toAdjustmentResponse(adjustment: {
    id: string;
    adjustmentType: InventoryAdjustmentType;
    quantity: number;
    reason: string;
    referenceId: string | null;
  }) {
    return {
      id: adjustment.id,
      adjustmentType: adjustment.adjustmentType,
      quantity: adjustment.quantity,
      reason: adjustment.reason,
      referenceId: adjustment.referenceId,
    };
  }
}
