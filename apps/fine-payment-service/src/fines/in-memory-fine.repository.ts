import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateFineDto } from './dto/create-fine.dto';
import { ListFinesQueryDto } from './dto/list-fines.query.dto';
import { RecordFinePaymentDto } from './dto/record-fine-payment.dto';
import { FineStatus } from './enums/fine-status.enum';
import {
  FineRepository,
  PaginatedFines,
  RecordPaymentResult,
} from './fine.repository';
import { Fine } from './interfaces/fine.interface';
import { FinePayment } from './interfaces/fine-payment.interface';

@Injectable()
export class InMemoryFineRepository implements FineRepository {
  private readonly fines = new Map<string, Fine>();
  private readonly payments = new Map<string, FinePayment[]>();

  create(createFineDto: CreateFineDto, issuedDate: Date): Promise<Fine> {
    const now = new Date();
    const fine: Fine = {
      id: randomUUID(),
      memberId: createFineDto.memberId,
      borrowId: createFineDto.borrowId,
      amount: createFineDto.amount,
      reason: createFineDto.reason,
      status: createFineDto.status,
      issuedDate,
      paidDate: null,
      waivedDate: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    };

    this.fines.set(fine.id, fine);
    return Promise.resolve(fine);
  }

  list(query: ListFinesQueryDto): Promise<PaginatedFines> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const items = [...this.fines.values()]
      .filter((fine) =>
        query.memberId ? fine.memberId === query.memberId : true,
      )
      .filter((fine) =>
        query.borrowId ? fine.borrowId === query.borrowId : true,
      )
      .filter((fine) => (query.status ? fine.status === query.status : true))
      .sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
      );

    const totalItems = items.length;
    const offset = (page - 1) * limit;

    return Promise.resolve({
      items: items.slice(offset, offset + limit),
      totalItems,
    });
  }

  findById(id: string): Promise<Fine | null> {
    return Promise.resolve(this.fines.get(id) ?? null);
  }

  findByBorrowId(borrowId: string): Promise<Fine | null> {
    for (const fine of this.fines.values()) {
      if (fine.borrowId === borrowId) {
        return Promise.resolve(fine);
      }
    }

    return Promise.resolve(null);
  }

  findByMemberId(memberId: string): Promise<Fine[]> {
    return Promise.resolve(
      [...this.fines.values()].filter((fine) => fine.memberId === memberId),
    );
  }

  recordPayment(
    fineId: string,
    recordFinePaymentDto: RecordFinePaymentDto,
    paymentDate: Date,
    recordedByUserId?: string,
  ): Promise<RecordPaymentResult> {
    const existingFine = this.fines.get(fineId);
    if (!existingFine) {
      throw new Error(`Fine ${fineId} not found`);
    }

    const payment: FinePayment = {
      id: randomUUID(),
      fineId,
      amount: recordFinePaymentDto.amount,
      paymentMethod: recordFinePaymentDto.paymentMethod,
      paymentDate,
      transactionReference: recordFinePaymentDto.transactionReference ?? null,
      recordedByUserId: recordedByUserId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedFine: Fine = {
      ...existingFine,
      status: FineStatus.PAID,
      paidDate: paymentDate,
      updatedAt: new Date(),
    };

    this.fines.set(fineId, updatedFine);
    this.payments.set(fineId, [...(this.payments.get(fineId) ?? []), payment]);

    return Promise.resolve({
      fine: updatedFine,
      payment,
    });
  }
}
