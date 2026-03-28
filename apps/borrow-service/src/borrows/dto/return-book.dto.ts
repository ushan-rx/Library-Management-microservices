import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReturnBookDto {
  @ApiProperty({ example: '2026-03-10', format: 'date' })
  @IsDateString()
  returnDate!: string;
}
