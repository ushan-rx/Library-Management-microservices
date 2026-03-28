import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../enums/payment-method.enum';

export class RecordFinePaymentDto {
  @ApiProperty({ minimum: 0, example: 500 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({ example: '2026-03-28', format: 'date' })
  @IsDateString()
  paymentDate!: string;

  @ApiPropertyOptional({ example: 'TRX-12345' })
  @IsOptional()
  @IsString()
  transactionReference?: string;
}
