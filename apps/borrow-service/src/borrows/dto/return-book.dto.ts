import { IsDateString } from 'class-validator';

export class ReturnBookDto {
  @IsDateString()
  returnDate!: string;
}
