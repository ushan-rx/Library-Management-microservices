import { IsDateString, IsOptional } from 'class-validator';

export class UpdateBorrowDto {
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
