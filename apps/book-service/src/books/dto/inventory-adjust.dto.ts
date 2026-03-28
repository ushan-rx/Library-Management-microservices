import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class InventoryAdjustDto {
  @IsString()
  reason!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsUUID()
  referenceId?: string;
}
