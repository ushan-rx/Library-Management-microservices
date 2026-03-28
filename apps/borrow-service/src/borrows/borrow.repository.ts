import { ListBorrowsQueryDto } from './dto/list-borrows.query.dto';
import { BorrowStatus } from './enums/borrow-status.enum';
import { Borrow } from './interfaces/borrow.interface';

export const BORROW_REPOSITORY = Symbol('BORROW_REPOSITORY');

export interface PaginatedBorrows {
  items: Borrow[];
  totalItems: number;
}

export interface CreateBorrowRecordInput {
  id: string;
  memberId: string;
  bookId: string;
  borrowDate: Date;
  dueDate: Date;
  status: BorrowStatus;
  fineGenerated: boolean;
  createdByUserId?: string;
}

export interface BorrowUpdateData {
  dueDate?: Date;
  returnDate?: Date;
  status?: BorrowStatus;
  fineGenerated?: boolean;
  returnedByUserId?: string;
}

export interface BorrowRepository {
  create(input: CreateBorrowRecordInput): Promise<Borrow>;
  list(query: ListBorrowsQueryDto): Promise<PaginatedBorrows>;
  findById(id: string): Promise<Borrow | null>;
  update(id: string, updateData: BorrowUpdateData): Promise<Borrow>;
}
