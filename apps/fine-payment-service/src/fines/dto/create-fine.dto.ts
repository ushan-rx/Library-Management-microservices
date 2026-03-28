import { IsEnum, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { FineStatus } from '../enums/fine-status.enum';

export class CreateFineDto {
  @IsUUID()
  memberId!: string;

  @IsUUID()
  borrowId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  reason!: string;

  @IsEnum(FineStatus)
  status!: FineStatus;
}
