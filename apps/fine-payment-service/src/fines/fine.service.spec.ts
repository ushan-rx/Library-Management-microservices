import { Test, TestingModule } from '@nestjs/testing';
import { FINE_REPOSITORY } from './fine.repository';
import { FineService } from './fine.service';
import { InMemoryFineRepository } from './in-memory-fine.repository';
import { FineStatus } from './enums/fine-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';

describe('FineService', () => {
  let service: FineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FineService,
        InMemoryFineRepository,
        {
          provide: FINE_REPOSITORY,
          useExisting: InMemoryFineRepository,
        },
      ],
    }).compile();

    service = module.get<FineService>(FineService);
  });

  it('creates a fine', async () => {
    const response = await service.create({
      memberId: '20000000-0000-4000-8000-000000000001',
      borrowId: '30000000-0000-4000-8000-000000000001',
      amount: 500,
      reason: 'OVERDUE_RETURN',
      status: FineStatus.PENDING,
    });

    expect(response.success).toBe(true);
    expect(response.data.status).toBe('PENDING');
  });

  it('rejects duplicate fines for the same borrow', async () => {
    await service.create({
      memberId: '20000000-0000-4000-8000-000000000001',
      borrowId: '30000000-0000-4000-8000-000000000001',
      amount: 500,
      reason: 'OVERDUE_RETURN',
      status: FineStatus.PENDING,
    });

    await expect(
      service.create({
        memberId: '20000000-0000-4000-8000-000000000001',
        borrowId: '30000000-0000-4000-8000-000000000001',
        amount: 500,
        reason: 'OVERDUE_RETURN',
        status: FineStatus.PENDING,
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'FINE_ALREADY_EXISTS',
        },
      },
    });
  });

  it('records a payment and updates the fine status', async () => {
    const created = await service.create({
      memberId: '20000000-0000-4000-8000-000000000001',
      borrowId: '30000000-0000-4000-8000-000000000002',
      amount: 500,
      reason: 'OVERDUE_RETURN',
      status: FineStatus.PENDING,
    });

    const response = await service.recordPayment(created.data.id, {
      amount: 500,
      paymentMethod: PaymentMethod.CASH,
      paymentDate: '2026-03-28',
    });

    expect(response.success).toBe(true);
    expect(response.data.fineStatus).toBe('PAID');
  });
});
