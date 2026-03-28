import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookStatus } from '../enums/book-status.enum';

export class UpdateBookDto {
  @ApiPropertyOptional({ maxLength: 255, example: 'Clean Code' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ maxLength: 255, example: 'Robert C. Martin' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  author?: string;

  @ApiPropertyOptional({ maxLength: 30, example: '9780132350884' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  isbn?: string;

  @ApiPropertyOptional({ example: 2008 })
  @IsOptional()
  @IsInt()
  publishedYear?: number;

  @ApiPropertyOptional({
    format: 'uuid',
    example: '11111111-1111-4111-8111-111111111111',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ minimum: 0, example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalCopies?: number;

  @ApiPropertyOptional({ minimum: 0, example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  availableCopies?: number;

  @ApiPropertyOptional({ enum: BookStatus, example: BookStatus.ACTIVE })
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;
}
