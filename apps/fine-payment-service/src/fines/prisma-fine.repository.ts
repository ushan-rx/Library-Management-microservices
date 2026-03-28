import { Injectable } from '@nestjs/common';
import {
  FineStatus as PrismaFineStatus,
  PaymentMethod as PrismaPaymentMethod,
  Prisma,
} from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
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
export class PrismaFineRepository implements FineRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createFineDto: CreateFineDto, issuedDate: Date): Promise<Fine> {
    const fine = await this.prismaService.fine.create({
      data: {
        memberId: createFineDto.memberId,
        borrowId: createFineDto.borrowId,
        amount: createFineDto.amount,
        reason: createFineDto.reason,
        status: this.toPrismaFineStatus(createFineDto.status),
        issuedDate,
      },
    });

    return this.toDomainFine(fine);
  }

  async list(query: ListFinesQueryDto): Promise<PaginatedFines> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.FineWhereInput = {
      ...(query.memberId ? { memberId: query.memberId } : {}),
      ...(query.borrowId ? { borrowId: query.borrowId } : {}),
      ...(query.status
        ? { status: this.toPrismaFineStatus(query.status) }
        : {}),
    };

    const [items, totalItems] = await this.prismaService.$transaction([
      this.prismaService.fine.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.fine.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toDomainFine(item)),
      totalItems,
    };
  }

  async findById(id: string): Promise<Fine | null> {
    const fine = await this.prismaService.fine.findUnique({
      where: { id },
    });

    return fine ? this.toDomainFine(fine) : null;
  }

  async findByBorrowId(borrowId: string): Promise<Fine | null> {
    const fine = await this.prismaService.fine.findFirst({
      where: { borrowId },
      orderBy: { createdAt: 'desc' },
    });

    return fine ? this.toDomainFine(fine) : null;
  }

  async findByMemberId(memberId: string): Promise<Fine[]> {
    const fines = await this.prismaService.fine.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    });

    return fines.map((fine) => this.toDomainFine(fine));
  }

  async recordPayment(
    fineId: string,
    recordFinePaymentDto: RecordFinePaymentDto,
    paymentDate: Date,
    recordedByUserId?: string,
  ): Promise<RecordPaymentResult> {
    return this.prismaService.$transaction(async (tx) => {
      const payment = await tx.finePayment.create({
        data: {
          fineId,
          amount: recordFinePaymentDto.amount,
          paymentMethod: this.toPrismaPaymentMethod(
            recordFinePaymentDto.paymentMethod,
          ),
          paymentDate,
          transactionReference:
            recordFinePaymentDto.transactionReference ?? null,
          recordedByUserId: recordedByUserId ?? null,
        },
      });

      const fine = await tx.fine.update({
        where: { id: fineId },
        data: {
          status: PrismaFineStatus.PAID,
          paidDate: paymentDate,
        },
      });

      return {
        fine: this.toDomainFine(fine),
        payment: this.toDomainPayment(payment),
      };
    });
  }

  private toDomainFine(fine: {
    id: string;
    memberId: string;
    borrowId: string;
    amount: Prisma.Decimal | number;
    reason: string;
    status: PrismaFineStatus;
    issuedDate: Date;
    paidDate: Date | null;
    waivedDate: Date | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Fine {
    return {
      id: fine.id,
      memberId: fine.memberId,
      borrowId: fine.borrowId,
      amount: Number(fine.amount),
      reason: fine.reason,
      status: this.toDomainFineStatus(fine.status),
      issuedDate: fine.issuedDate,
      paidDate: fine.paidDate,
      waivedDate: fine.waivedDate,
      notes: fine.notes,
      createdAt: fine.createdAt,
      updatedAt: fine.updatedAt,
    };
  }

  private toDomainPayment(payment: {
    id: string;
    fineId: string;
    amount: Prisma.Decimal | number;
    paymentMethod: PrismaPaymentMethod;
    paymentDate: Date;
    transactionReference: string | null;
    recordedByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): FinePayment {
    return {
      id: payment.id,
      fineId: payment.fineId,
      amount: Number(payment.amount),
      paymentMethod: this.toDomainPaymentMethod(payment.paymentMethod),
      paymentDate: payment.paymentDate,
      transactionReference: payment.transactionReference,
      recordedByUserId: payment.recordedByUserId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  private toPrismaFineStatus(status: FineStatus): PrismaFineStatus {
    return status as PrismaFineStatus;
  }

  private toDomainFineStatus(status: PrismaFineStatus): FineStatus {
    return status as FineStatus;
  }

  private toPrismaPaymentMethod(
    paymentMethod: import('./enums/payment-method.enum').PaymentMethod,
  ): PrismaPaymentMethod {
    return paymentMethod as PrismaPaymentMethod;
  }

  private toDomainPaymentMethod(
    paymentMethod: PrismaPaymentMethod,
  ): import('./enums/payment-method.enum').PaymentMethod {
    return paymentMethod as import('./enums/payment-method.enum').PaymentMethod;
  }
}
