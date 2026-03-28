import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

export class RecordFinePaymentDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsDateString()
  paymentDate!: string;

  @IsOptional()
  @IsString()
  transactionReference?: string;
}
