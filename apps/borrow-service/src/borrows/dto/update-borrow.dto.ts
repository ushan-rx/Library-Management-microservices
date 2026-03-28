import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBorrowDto {
  @ApiPropertyOptional({ example: '2026-03-12', format: 'date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
