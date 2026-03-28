import { Injectable } from '@nestjs/common';
import {
  Prisma,
  BookStatus as PrismaBookStatus,
  InventoryAdjustmentType as PrismaInventoryAdjustmentType,
} from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
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
export class PrismaBookRepository implements BookRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = await this.prismaService.book.create({
      data: {
        title: createBookDto.title,
        author: createBookDto.author,
        isbn: createBookDto.isbn ?? null,
        publishedYear: createBookDto.publishedYear ?? null,
        categoryId: createBookDto.categoryId,
        totalCopies: createBookDto.totalCopies,
        availableCopies: createBookDto.availableCopies,
        status: this.toPrismaBookStatus(createBookDto.status),
      },
    });

    return this.toDomainBook(book);
  }

  async list(query: ListBooksQueryDto): Promise<PaginatedBooks> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.BookWhereInput = {
      deletedAt: null,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.status
        ? { status: this.toPrismaBookStatus(query.status) }
        : {}),
      ...(query.availableOnly
        ? {
            status: PrismaBookStatus.ACTIVE,
            availableCopies: {
              gt: 0,
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                title: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                author: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                isbn: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, totalItems] = await this.prismaService.$transaction([
      this.prismaService.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.book.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toDomainBook(item)),
      totalItems,
    };
  }

  async findById(id: string): Promise<Book | null> {
    const book = await this.prismaService.book.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    return book ? this.toDomainBook(book) : null;
  }

  async findByIdIncludingDeleted(id: string): Promise<Book | null> {
    const book = await this.prismaService.book.findUnique({
      where: { id },
    });

    return book ? this.toDomainBook(book) : null;
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    const book = await this.prismaService.book.findFirst({
      where: {
        isbn,
        deletedAt: null,
      },
    });

    return book ? this.toDomainBook(book) : null;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.prismaService.book.update({
      where: { id },
      data: {
        ...(updateBookDto.title !== undefined
          ? { title: updateBookDto.title }
          : {}),
        ...(updateBookDto.author !== undefined
          ? { author: updateBookDto.author }
          : {}),
        ...(updateBookDto.isbn !== undefined
          ? { isbn: updateBookDto.isbn ?? null }
          : {}),
        ...(updateBookDto.publishedYear !== undefined
          ? { publishedYear: updateBookDto.publishedYear ?? null }
          : {}),
        ...(updateBookDto.categoryId !== undefined
          ? { categoryId: updateBookDto.categoryId }
          : {}),
        ...(updateBookDto.totalCopies !== undefined
          ? { totalCopies: updateBookDto.totalCopies }
          : {}),
        ...(updateBookDto.availableCopies !== undefined
          ? { availableCopies: updateBookDto.availableCopies }
          : {}),
        ...(updateBookDto.status !== undefined
          ? { status: this.toPrismaBookStatus(updateBookDto.status) }
          : {}),
      },
    });

    return this.toDomainBook(book);
  }

  async softDelete(id: string): Promise<Book> {
    const book = await this.prismaService.book.update({
      where: { id },
      data: {
        status: PrismaBookStatus.INACTIVE,
        deletedAt: new Date(),
      },
    });

    return this.toDomainBook(book);
  }

  async adjustInventory(
    id: string,
    adjustmentType: InventoryAdjustmentType,
    adjustDto: InventoryAdjustDto,
  ): Promise<InventoryAdjustmentResult> {
    return this.prismaService.$transaction(async (tx) => {
      const book = await tx.book.update({
        where: { id },
        data: {
          availableCopies: {
            increment:
              adjustmentType === InventoryAdjustmentType.INCREMENT
                ? adjustDto.quantity
                : -adjustDto.quantity,
          },
        },
      });

      const adjustment = await tx.bookInventoryAdjustment.create({
        data: {
          bookId: id,
          adjustmentType: this.toPrismaAdjustmentType(adjustmentType),
          quantity: adjustDto.quantity,
          reason: adjustDto.reason,
          referenceId: adjustDto.referenceId ?? null,
        },
      });

      return {
        book: this.toDomainBook(book),
        adjustment: this.toDomainAdjustment(adjustment),
      };
    });
  }

  private toDomainBook(book: {
    id: string;
    title: string;
    author: string;
    isbn: string | null;
    publishedYear: number | null;
    categoryId: string;
    totalCopies: number;
    availableCopies: number;
    status: PrismaBookStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Book {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
      categoryId: book.categoryId,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      status: this.toDomainBookStatus(book.status),
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      deletedAt: book.deletedAt,
    };
  }

  private toDomainAdjustment(adjustment: {
    id: string;
    bookId: string;
    adjustmentType: PrismaInventoryAdjustmentType;
    quantity: number;
    reason: string;
    referenceId: string | null;
    createdAt: Date;
  }): BookInventoryAdjustment {
    return {
      id: adjustment.id,
      bookId: adjustment.bookId,
      adjustmentType: this.toDomainAdjustmentType(adjustment.adjustmentType),
      quantity: adjustment.quantity,
      reason: adjustment.reason,
      referenceId: adjustment.referenceId,
      createdAt: adjustment.createdAt,
    };
  }

  private toPrismaBookStatus(status: BookStatus): PrismaBookStatus {
    return status as PrismaBookStatus;
  }

  private toDomainBookStatus(status: PrismaBookStatus): BookStatus {
    return status as BookStatus;
  }

  private toPrismaAdjustmentType(
    adjustmentType: InventoryAdjustmentType,
  ): PrismaInventoryAdjustmentType {
    return adjustmentType as PrismaInventoryAdjustmentType;
  }

  private toDomainAdjustmentType(
    adjustmentType: PrismaInventoryAdjustmentType,
  ): InventoryAdjustmentType {
    return adjustmentType as InventoryAdjustmentType;
  }
}
