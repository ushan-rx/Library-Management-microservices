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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookStatus } from '../enums/book-status.enum';

export class CreateBookDto {
  @ApiProperty({ maxLength: 255, example: 'Clean Code' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ maxLength: 255, example: 'Robert C. Martin' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  author!: string;

  @ApiPropertyOptional({ maxLength: 30, example: '9780132350884' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  isbn?: string;

  @ApiPropertyOptional({ example: 2008 })
  @IsOptional()
  @IsInt()
  publishedYear?: number;

  @ApiProperty({
    format: 'uuid',
    example: '11111111-1111-4111-8111-111111111111',
  })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ minimum: 0, example: 5 })
  @IsInt()
  @Min(0)
  totalCopies!: number;

  @ApiProperty({ minimum: 0, example: 5 })
  @IsInt()
  @Min(0)
  availableCopies!: number;

  @ApiProperty({ enum: BookStatus, example: BookStatus.ACTIVE })
  @IsEnum(BookStatus)
  status!: BookStatus;
}
