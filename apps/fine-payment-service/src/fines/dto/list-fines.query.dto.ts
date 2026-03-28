import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FineStatus } from '../enums/fine-status.enum';

export class ListFinesQueryDto {
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
    example: '30000000-0000-4000-8000-000000000001',
  })
  @IsOptional()
  @IsUUID()
  borrowId?: string;

  @ApiPropertyOptional({ enum: FineStatus, example: FineStatus.PENDING })
  @IsOptional()
  @IsEnum(FineStatus)
  status?: FineStatus;
}
