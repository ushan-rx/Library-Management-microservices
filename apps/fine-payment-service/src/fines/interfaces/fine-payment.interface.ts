import { PaymentMethod } from '../enums/payment-method.enum';

export interface FinePayment {
  id: string;
  fineId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  transactionReference: string | null;
  recordedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
