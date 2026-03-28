import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { BookStatus } from '../enums/book-status.enum';

export class CreateBookDto {
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  title!: string;

  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  author!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  isbn?: string;

  @IsOptional()
  @IsInt()
  publishedYear?: number;

  @IsUUID()
  categoryId!: string;

  @IsInt()
  @Min(0)
  totalCopies!: number;

  @IsInt()
  @Min(0)
  availableCopies!: number;

  @IsEnum(BookStatus)
  status!: BookStatus;
}
