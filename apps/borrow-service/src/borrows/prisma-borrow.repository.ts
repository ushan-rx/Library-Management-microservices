import { Injectable } from '@nestjs/common';
import {
  BorrowStatus as PrismaBorrowStatus,
  Prisma,
} from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { BorrowStatus } from './enums/borrow-status.enum';
import {
  BorrowRepository,
  BorrowUpdateData,
  CreateBorrowRecordInput,
  PaginatedBorrows,
} from './borrow.repository';
import { ListBorrowsQueryDto } from './dto/list-borrows.query.dto';
import { Borrow } from './interfaces/borrow.interface';

@Injectable()
export class PrismaBorrowRepository implements BorrowRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(input: CreateBorrowRecordInput): Promise<Borrow> {
    const borrow = await this.prismaService.borrow.create({
      data: {
        id: input.id,
        memberId: input.memberId,
        bookId: input.bookId,
        borrowDate: input.borrowDate,
        dueDate: input.dueDate,
        status: this.toPrismaStatus(input.status),
        fineGenerated: input.fineGenerated,
        createdByUserId: input.createdByUserId ?? null,
      },
    });

    return this.toDomainBorrow(borrow);
  }

  async list(query: ListBorrowsQueryDto): Promise<PaginatedBorrows> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const where: Prisma.BorrowWhereInput = {
      deletedAt: null,
      ...(query.memberId ? { memberId: query.memberId } : {}),
      ...(query.bookId ? { bookId: query.bookId } : {}),
      ...(query.status ? { status: this.toPrismaStatus(query.status) } : {}),
      ...(query.overdueOnly
        ? {
            status: PrismaBorrowStatus.BORROWED,
            dueDate: {
              lt: today,
            },
          }
        : {}),
    };

    const [items, totalItems] = await this.prismaService.$transaction([
      this.prismaService.borrow.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.borrow.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toDomainBorrow(item)),
      totalItems,
    };
  }

  async findById(id: string): Promise<Borrow | null> {
    const borrow = await this.prismaService.borrow.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    return borrow ? this.toDomainBorrow(borrow) : null;
  }

  async update(id: string, updateData: BorrowUpdateData): Promise<Borrow> {
    const borrow = await this.prismaService.borrow.update({
      where: { id },
      data: {
        ...(updateData.dueDate !== undefined
          ? { dueDate: updateData.dueDate }
          : {}),
        ...(updateData.returnDate !== undefined
          ? { returnDate: updateData.returnDate }
          : {}),
        ...(updateData.status !== undefined
          ? { status: this.toPrismaStatus(updateData.status) }
          : {}),
        ...(updateData.fineGenerated !== undefined
          ? { fineGenerated: updateData.fineGenerated }
          : {}),
        ...(updateData.returnedByUserId !== undefined
          ? { returnedByUserId: updateData.returnedByUserId ?? null }
          : {}),
      },
    });

    return this.toDomainBorrow(borrow);
  }

  private toDomainBorrow(borrow: {
    id: string;
    memberId: string;
    bookId: string;
    borrowDate: Date;
    dueDate: Date;
    returnDate: Date | null;
    status: PrismaBorrowStatus;
    fineGenerated: boolean;
    createdByUserId: string | null;
    returnedByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Borrow {
    return {
      id: borrow.id,
      memberId: borrow.memberId,
      bookId: borrow.bookId,
      borrowDate: borrow.borrowDate,
      dueDate: borrow.dueDate,
      returnDate: borrow.returnDate,
      status: this.toDomainStatus(borrow.status),
      fineGenerated: borrow.fineGenerated,
      createdByUserId: borrow.createdByUserId,
      returnedByUserId: borrow.returnedByUserId,
      createdAt: borrow.createdAt,
      updatedAt: borrow.updatedAt,
      deletedAt: borrow.deletedAt,
    };
  }

  private toPrismaStatus(status: BorrowStatus): PrismaBorrowStatus {
    return status as PrismaBorrowStatus;
  }

  private toDomainStatus(status: PrismaBorrowStatus): BorrowStatus {
    return status as BorrowStatus;
  }
}
