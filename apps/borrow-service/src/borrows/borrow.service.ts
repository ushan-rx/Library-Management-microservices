import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  borrowBadRequest,
  borrowConflict,
  borrowNotFound,
} from '../common/borrow-response.helpers';
import { BookClient } from '../integrations/book.client';
import { FineClient } from '../integrations/fine.client';
import { MemberClient } from '../integrations/member.client';
import {
  BORROW_REPOSITORY,
} from './borrow.repository';
import type {
  BorrowRepository,
  BorrowUpdateData,
} from './borrow.repository';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { ListBorrowsQueryDto } from './dto/list-borrows.query.dto';
import { ReturnBookDto } from './dto/return-book.dto';
import { UpdateBorrowDto } from './dto/update-borrow.dto';
import { BorrowStatus } from './enums/borrow-status.enum';
import { Borrow } from './interfaces/borrow.interface';

@Injectable()
export class BorrowService {
  private readonly logger = new Logger(BorrowService.name);

  constructor(
    @Inject(BORROW_REPOSITORY)
    private readonly borrowRepository: BorrowRepository,
    private readonly memberClient: MemberClient,
    private readonly bookClient: BookClient,
    private readonly fineClient: FineClient,
  ) {}

  async create(createBorrowDto: CreateBorrowDto, createdByUserId?: string) {
    const borrowDate = this.parseDate(createBorrowDto.borrowDate, 'borrowDate');
    const dueDate = this.parseDate(createBorrowDto.dueDate, 'dueDate');
    this.assertDateOrder(borrowDate, dueDate, 'DUE_DATE_INVALID');

    await this.memberClient.validateBorrowEligibility(createBorrowDto.memberId);
    await this.bookClient.validateAvailability(createBorrowDto.bookId);

    const borrowId = randomUUID();
    await this.bookClient.decrementInventory(createBorrowDto.bookId, borrowId);

    const borrow = await this.borrowRepository.create({
      id: borrowId,
      memberId: createBorrowDto.memberId,
      bookId: createBorrowDto.bookId,
      borrowDate,
      dueDate,
      status: BorrowStatus.BORROWED,
      fineGenerated: false,
      createdByUserId,
    });

    this.logger.log(`Borrow record created: ${borrow.id}`);

    return {
      success: true,
      message: 'Borrow record created successfully',
      data: this.toBorrowSummary(borrow),
    };
  }

  async list(query: ListBorrowsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { items, totalItems } = await this.borrowRepository.list(query);

    return {
      success: true,
      message: 'Borrow records retrieved successfully',
      data: {
        items: items.map((borrow) => this.toBorrowDetails(borrow)),
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit),
        },
      },
    };
  }

  async getById(borrowId: string) {
    const borrow = await this.requireBorrow(borrowId);

    return {
      success: true,
      message: 'Borrow record retrieved successfully',
      data: this.toBorrowDetails(borrow),
    };
  }

  async update(borrowId: string, updateBorrowDto: UpdateBorrowDto) {
    const borrow = await this.requireBorrow(borrowId);

    if (borrow.status === BorrowStatus.RETURNED) {
      throw borrowConflict(
        'Returned borrow records cannot be updated',
        'BORROW_ALREADY_RETURNED',
      );
    }

    const updateData: BorrowUpdateData = {};
    if (updateBorrowDto.dueDate) {
      const dueDate = this.parseDate(updateBorrowDto.dueDate, 'dueDate');
      this.assertDateOrder(borrow.borrowDate, dueDate, 'DUE_DATE_INVALID');
      updateData.dueDate = dueDate;
    }

    const updatedBorrow = await this.borrowRepository.update(
      borrowId,
      updateData,
    );
    this.logger.log(`Borrow record updated: ${updatedBorrow.id}`);

    return {
      success: true,
      message: 'Borrow record updated successfully',
      data: this.toBorrowDetails(updatedBorrow),
    };
  }

  async returnBook(
    borrowId: string,
    returnBookDto: ReturnBookDto,
    returnedByUserId?: string,
  ) {
    const borrow = await this.requireBorrow(borrowId);
    if (borrow.status === BorrowStatus.RETURNED) {
      throw borrowConflict('Book already returned', 'BORROW_ALREADY_RETURNED');
    }

    const returnDate = this.parseDate(returnBookDto.returnDate, 'returnDate');
    this.assertDateOrder(borrow.borrowDate, returnDate, 'RETURN_DATE_INVALID');

    await this.bookClient.incrementInventory(borrow.bookId, borrow.id);

    let fineGenerated = false;
    let fineId: string | null = null;
    const overdueDays = this.calculateOverdueDays(borrow.dueDate, returnDate);

    if (overdueDays > 0) {
      const amountPerDay = Number.parseInt(
        process.env.BORROW_FINE_AMOUNT_PER_DAY ?? '100',
        10,
      );
      fineId = await this.fineClient.createOverdueFine({
        memberId: borrow.memberId,
        borrowId: borrow.id,
        amount: overdueDays * amountPerDay,
      });
      fineGenerated = true;
    }

    const updatedBorrow = await this.borrowRepository.update(borrowId, {
      returnDate,
      status: BorrowStatus.RETURNED,
      fineGenerated,
      returnedByUserId,
    });

    this.logger.log(`Borrow record returned: ${updatedBorrow.id}`);

    return {
      success: true,
      message: 'Book returned successfully',
      data: {
        borrowId: updatedBorrow.id,
        status: updatedBorrow.status,
        returnDate: this.formatDate(updatedBorrow.returnDate),
        fineGenerated,
        fineId,
      },
    };
  }

  async overdueStatus(borrowId: string) {
    const borrow = await this.requireBorrow(borrowId);
    const compareDate =
      borrow.returnDate ?? this.parseDate(new Date().toISOString(), 'today');
    const daysOverdue = this.calculateOverdueDays(borrow.dueDate, compareDate);

    return {
      success: true,
      message: 'Overdue status checked successfully',
      data: {
        borrowId: borrow.id,
        overdue: daysOverdue > 0,
        daysOverdue,
      },
    };
  }

  health() {
    return {
      success: true,
      message: 'Borrow service healthy',
      data: {
        service: process.env.BORROW_SERVICE_NAME ?? 'borrow-service',
        status: 'UP',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private async requireBorrow(borrowId: string): Promise<Borrow> {
    const borrow = await this.borrowRepository.findById(borrowId);
    if (!borrow) {
      throw borrowNotFound();
    }

    return borrow;
  }

  private parseDate(value: string, field: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw borrowBadRequest(`${field} must be a valid date`, 'INVALID_DATE');
    }

    date.setHours(0, 0, 0, 0);
    return date;
  }

  private assertDateOrder(from: Date, to: Date, code: string) {
    if (to < from) {
      throw borrowBadRequest('Date order is invalid', code);
    }
  }

  private calculateOverdueDays(dueDate: Date, compareDate: Date): number {
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const compare = new Date(compareDate);
    compare.setHours(0, 0, 0, 0);

    if (compare <= due) {
      return 0;
    }

    const differenceInMs = compare.getTime() - due.getTime();
    return Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
  }

  private formatDate(date: Date | null): string | null {
    if (!date) {
      return null;
    }

    return date.toISOString().slice(0, 10);
  }

  private toBorrowSummary(borrow: Borrow) {
    return {
      id: borrow.id,
      memberId: borrow.memberId,
      bookId: borrow.bookId,
      borrowDate: this.formatDate(borrow.borrowDate),
      dueDate: this.formatDate(borrow.dueDate),
      status: borrow.status,
    };
  }

  private toBorrowDetails(borrow: Borrow) {
    return {
      id: borrow.id,
      memberId: borrow.memberId,
      bookId: borrow.bookId,
      borrowDate: this.formatDate(borrow.borrowDate),
      dueDate: this.formatDate(borrow.dueDate),
      returnDate: this.formatDate(borrow.returnDate),
      status: borrow.status,
      fineGenerated: borrow.fineGenerated,
      createdByUserId: borrow.createdByUserId,
      returnedByUserId: borrow.returnedByUserId,
      createdAt: borrow.createdAt,
      updatedAt: borrow.updatedAt,
    };
  }
}
