import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { BorrowStatus } from '../enums/borrow-status.enum';

export class ListBorrowsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    format: 'uuid',
    example: '20000000-0000-4000-8000-000000000001',
  })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    example: '10000000-0000-4000-8000-000000000001',
  })
  @IsOptional()
  @IsUUID()
  bookId?: string;

  @ApiPropertyOptional({ enum: BorrowStatus, example: BorrowStatus.BORROWED })
  @IsOptional()
  @IsEnum(BorrowStatus)
  status?: BorrowStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  overdueOnly?: boolean;
}
