import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  fineBadRequest,
  fineConflict,
  fineNotFound,
} from '../common/fine-response.helpers';
import { CreateFineDto } from './dto/create-fine.dto';
import { ListFinesQueryDto } from './dto/list-fines.query.dto';
import { RecordFinePaymentDto } from './dto/record-fine-payment.dto';
import { FineStatus } from './enums/fine-status.enum';
import { FINE_REPOSITORY, FineRepository } from './fine.repository';
import { Fine } from './interfaces/fine.interface';

@Injectable()
export class FineService {
  private readonly logger = new Logger(FineService.name);

  constructor(
    @Inject(FINE_REPOSITORY)
    private readonly fineRepository: FineRepository,
  ) {}

  async create(createFineDto: CreateFineDto) {
    await this.assertBorrowHasNoActiveFine(createFineDto.borrowId);

    const issuedDate = new Date();
    issuedDate.setHours(0, 0, 0, 0);

    const fine = await this.fineRepository.create(createFineDto, issuedDate);
    this.logger.log(`Fine created: ${fine.id}`);

    return {
      success: true,
      message: 'Fine created successfully',
      data: {
        id: fine.id,
        memberId: fine.memberId,
        borrowId: fine.borrowId,
        amount: fine.amount,
        status: fine.status,
      },
    };
  }

  async list(query: ListFinesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { items, totalItems } = await this.fineRepository.list(query);

    return {
      success: true,
      message: 'Fines retrieved successfully',
      data: {
        items: items.map((fine) => this.toFineResponse(fine)),
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit),
        },
      },
    };
  }

  async getById(fineId: string) {
    const fine = await this.requireFine(fineId);

    return {
      success: true,
      message: 'Fine retrieved successfully',
      data: this.toFineResponse(fine),
    };
  }

  async recordPayment(
    fineId: string,
    recordFinePaymentDto: RecordFinePaymentDto,
    recordedByUserId?: string,
  ) {
    const fine = await this.requireFine(fineId);

    if (fine.status === FineStatus.PAID) {
      throw fineConflict('Fine is already paid', 'FINE_ALREADY_PAID');
    }

    if (recordFinePaymentDto.amount !== fine.amount) {
      throw fineBadRequest(
        'Payment amount must match the outstanding fine amount',
        'INVALID_PAYMENT_AMOUNT',
      );
    }

    const paymentDate = new Date(recordFinePaymentDto.paymentDate);
    paymentDate.setHours(0, 0, 0, 0);

    const result = await this.fineRepository.recordPayment(
      fineId,
      recordFinePaymentDto,
      paymentDate,
      recordedByUserId,
    );

    this.logger.log(`Fine payment recorded: ${result.payment.id}`);

    return {
      success: true,
      message: 'Fine payment recorded successfully',
      data: {
        paymentId: result.payment.id,
        fineId: result.fine.id,
        amount: result.payment.amount,
        paymentMethod: result.payment.paymentMethod,
        paymentDate: this.formatDate(result.payment.paymentDate),
        fineStatus: result.fine.status,
      },
    };
  }

  async getByBorrowId(borrowId: string) {
    const fine = await this.fineRepository.findByBorrowId(borrowId);
    if (!fine) {
      throw fineNotFound();
    }

    return {
      success: true,
      message: 'Fine retrieved successfully',
      data: this.toFineResponse(fine),
    };
  }

  async getByMemberId(memberId: string) {
    const fines = await this.fineRepository.findByMemberId(memberId);

    return {
      success: true,
      message: 'Fines retrieved successfully',
      data: fines.map((fine) => this.toFineResponse(fine)),
    };
  }

  health() {
    return {
      success: true,
      message: 'Fine payment service healthy',
      data: {
        service:
          process.env.FINE_PAYMENT_SERVICE_NAME ?? 'fine-payment-service',
        status: 'UP',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private async requireFine(fineId: string): Promise<Fine> {
    const fine = await this.fineRepository.findById(fineId);
    if (!fine) {
      throw fineNotFound();
    }

    return fine;
  }

  private async assertBorrowHasNoActiveFine(borrowId: string) {
    const existingFine = await this.fineRepository.findByBorrowId(borrowId);
    if (existingFine && existingFine.status !== FineStatus.WAIVED) {
      throw fineConflict(
        'An active fine already exists for this borrow record',
        'FINE_ALREADY_EXISTS',
      );
    }
  }

  private toFineResponse(fine: Fine) {
    return {
      id: fine.id,
      memberId: fine.memberId,
      borrowId: fine.borrowId,
      amount: fine.amount,
      reason: fine.reason,
      status: fine.status,
      issuedDate: this.formatDate(fine.issuedDate),
      paidDate: this.formatDate(fine.paidDate),
      createdAt: fine.createdAt,
      updatedAt: fine.updatedAt,
    };
  }

  private formatDate(date: Date | null): string | null {
    if (!date) {
      return null;
    }

    return date.toISOString().slice(0, 10);
  }
}
