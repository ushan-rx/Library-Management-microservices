import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryAdjustDto {
  @ApiProperty({ example: 'BORROW_CREATED' })
  @IsString()
  reason!: string;

  @ApiProperty({ minimum: 1, example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({
    format: 'uuid',
    example: '22222222-2222-4222-8222-222222222222',
  })
  @IsOptional()
  @IsUUID()
  referenceId?: string;
}
