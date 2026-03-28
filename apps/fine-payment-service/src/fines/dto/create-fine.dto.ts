import { IsEnum, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FineStatus } from '../enums/fine-status.enum';

export class CreateFineDto {
  @ApiProperty({
    format: 'uuid',
    example: '20000000-0000-4000-8000-000000000001',
  })
  @IsUUID()
  memberId!: string;

  @ApiProperty({
    format: 'uuid',
    example: '30000000-0000-4000-8000-000000000001',
  })
  @IsUUID()
  borrowId!: string;

  @ApiProperty({ minimum: 0, example: 500 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 'OVERDUE_RETURN' })
  @IsString()
  reason!: string;

  @ApiProperty({ enum: FineStatus, example: FineStatus.PENDING })
  @IsEnum(FineStatus)
  status!: FineStatus;
}
