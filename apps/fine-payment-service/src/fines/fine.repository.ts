import { CreateFineDto } from './dto/create-fine.dto';
import { ListFinesQueryDto } from './dto/list-fines.query.dto';
import { RecordFinePaymentDto } from './dto/record-fine-payment.dto';
import { Fine } from './interfaces/fine.interface';
import { FinePayment } from './interfaces/fine-payment.interface';

export const FINE_REPOSITORY = Symbol('FINE_REPOSITORY');

export interface PaginatedFines {
  items: Fine[];
  totalItems: number;
}

export interface RecordPaymentResult {
  fine: Fine;
  payment: FinePayment;
}

export interface FineRepository {
  create(createFineDto: CreateFineDto, issuedDate: Date): Promise<Fine>;
  list(query: ListFinesQueryDto): Promise<PaginatedFines>;
  findById(id: string): Promise<Fine | null>;
  findByBorrowId(borrowId: string): Promise<Fine | null>;
  findByMemberId(memberId: string): Promise<Fine[]>;
  recordPayment(
    fineId: string,
    recordFinePaymentDto: RecordFinePaymentDto,
    paymentDate: Date,
    recordedByUserId?: string,
  ): Promise<RecordPaymentResult>;
}
