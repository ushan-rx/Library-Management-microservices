import { IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBorrowDto {
  @ApiProperty({
    format: 'uuid',
    example: '20000000-0000-4000-8000-000000000001',
  })
  @IsUUID()
  memberId!: string;

  @ApiProperty({
    format: 'uuid',
    example: '10000000-0000-4000-8000-000000000001',
  })
  @IsUUID()
  bookId!: string;

  @ApiProperty({ example: '2026-03-01', format: 'date' })
  @IsDateString()
  borrowDate!: string;

  @ApiProperty({ example: '2026-03-05', format: 'date' })
  @IsDateString()
  dueDate!: string;
}
