import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryStatus } from '../enums/category-status.enum';

export class ListCategoriesQueryDto {
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

  @ApiPropertyOptional({ example: 'Science' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CategoryStatus, example: CategoryStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}
