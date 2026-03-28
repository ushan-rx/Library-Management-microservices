import { IsDateString, IsUUID } from 'class-validator';

export class CreateBorrowDto {
  @IsUUID()
  memberId!: string;

  @IsUUID()
  bookId!: string;

  @IsDateString()
  borrowDate!: string;

  @IsDateString()
  dueDate!: string;
}
