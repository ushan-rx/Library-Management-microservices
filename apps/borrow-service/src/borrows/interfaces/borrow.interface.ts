import { BorrowStatus } from '../enums/borrow-status.enum';

export interface Borrow {
  id: string;
  memberId: string;
  bookId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: BorrowStatus;
  fineGenerated: boolean;
  createdByUserId: string | null;
  returnedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
