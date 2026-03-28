import { Injectable } from '@nestjs/common';
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
export class InMemoryBorrowRepository implements BorrowRepository {
  private readonly borrows = new Map<string, Borrow>();

  create(input: CreateBorrowRecordInput): Promise<Borrow> {
    const now = new Date();
    const borrow: Borrow = {
      id: input.id,
      memberId: input.memberId,
      bookId: input.bookId,
      borrowDate: input.borrowDate,
      dueDate: input.dueDate,
      returnDate: null,
      status: input.status,
      fineGenerated: input.fineGenerated,
      createdByUserId: input.createdByUserId ?? null,
      returnedByUserId: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.borrows.set(borrow.id, borrow);

    return Promise.resolve(borrow);
  }

  list(query: ListBorrowsQueryDto): Promise<PaginatedBorrows> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = [...this.borrows.values()]
      .filter((borrow) => borrow.deletedAt === null)
      .filter((borrow) =>
        query.memberId ? borrow.memberId === query.memberId : true,
      )
      .filter((borrow) =>
        query.bookId ? borrow.bookId === query.bookId : true,
      )
      .filter((borrow) =>
        query.status ? borrow.status === query.status : true,
      )
      .filter((borrow) => {
        if (!query.overdueOnly) {
          return true;
        }

        return (
          borrow.status === BorrowStatus.BORROWED && borrow.dueDate < today
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

  findById(id: string): Promise<Borrow | null> {
    const borrow = this.borrows.get(id);

    if (!borrow || borrow.deletedAt !== null) {
      return Promise.resolve(null);
    }

    return Promise.resolve(borrow);
  }

  update(id: string, updateData: BorrowUpdateData): Promise<Borrow> {
    const existingBorrow = this.borrows.get(id);
    if (!existingBorrow) {
      throw new Error(`Borrow ${id} not found`);
    }

    const updatedBorrow: Borrow = {
      ...existingBorrow,
      dueDate: updateData.dueDate ?? existingBorrow.dueDate,
      returnDate:
        updateData.returnDate === undefined
          ? existingBorrow.returnDate
          : updateData.returnDate,
      status: updateData.status ?? existingBorrow.status,
      fineGenerated: updateData.fineGenerated ?? existingBorrow.fineGenerated,
      returnedByUserId:
        updateData.returnedByUserId === undefined
          ? existingBorrow.returnedByUserId
          : updateData.returnedByUserId,
      updatedAt: new Date(),
    };

    this.borrows.set(id, updatedBorrow);

    return Promise.resolve(updatedBorrow);
  }
}
