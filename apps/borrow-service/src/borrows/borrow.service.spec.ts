import { Test, TestingModule } from '@nestjs/testing';
import { BORROW_REPOSITORY } from './borrow.repository';
import { BorrowService } from './borrow.service';
import { InMemoryBorrowRepository } from './in-memory-borrow.repository';
import { MemberClient } from '../integrations/member.client';
import { BookClient } from '../integrations/book.client';
import { FineClient } from '../integrations/fine.client';

describe('BorrowService', () => {
  let service: BorrowService;
  let memberClient: { validateBorrowEligibility: jest.Mock };
  let bookClient: {
    validateAvailability: jest.Mock;
    decrementInventory: jest.Mock;
    incrementInventory: jest.Mock;
  };
  let fineClient: { createOverdueFine: jest.Mock };

  beforeEach(async () => {
    process.env.BORROW_FINE_AMOUNT_PER_DAY = '100';

    memberClient = {
      validateBorrowEligibility: jest.fn().mockResolvedValue(undefined),
    };
    bookClient = {
      validateAvailability: jest.fn().mockResolvedValue(undefined),
      decrementInventory: jest.fn().mockResolvedValue(undefined),
      incrementInventory: jest.fn().mockResolvedValue(undefined),
    };
    fineClient = {
      createOverdueFine: jest.fn().mockResolvedValue('fine-001'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BorrowService,
        InMemoryBorrowRepository,
        {
          provide: BORROW_REPOSITORY,
          useExisting: InMemoryBorrowRepository,
        },
        {
          provide: MemberClient,
          useValue: memberClient,
        },
        {
          provide: BookClient,
          useValue: bookClient,
        },
        {
          provide: FineClient,
          useValue: fineClient,
        },
      ],
    }).compile();

    service = module.get<BorrowService>(BorrowService);
  });

  it('creates a borrow after validating member and book', async () => {
    const response = await service.create({
      memberId: '20000000-0000-4000-8000-000000000001',
      bookId: '10000000-0000-4000-8000-000000000001',
      borrowDate: '2026-03-01',
      dueDate: '2026-03-05',
    });

    expect(response.success).toBe(true);
    expect(response.data.status).toBe('BORROWED');
    expect(memberClient.validateBorrowEligibility).toHaveBeenCalled();
    expect(bookClient.decrementInventory).toHaveBeenCalled();
  });

  it('rejects blocked members', async () => {
    memberClient.validateBorrowEligibility.mockRejectedValue({
      response: {
        error: {
          code: 'MEMBER_NOT_ELIGIBLE',
        },
      },
    });

    await expect(
      service.create({
        memberId: '20000000-0000-4000-8000-000000000002',
        bookId: '10000000-0000-4000-8000-000000000001',
        borrowDate: '2026-03-01',
        dueDate: '2026-03-05',
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'MEMBER_NOT_ELIGIBLE',
        },
      },
    });
  });

  it('rejects unavailable books', async () => {
    bookClient.validateAvailability.mockRejectedValue({
      response: {
        error: {
          code: 'BOOK_NOT_AVAILABLE',
        },
      },
    });

    await expect(
      service.create({
        memberId: '20000000-0000-4000-8000-000000000001',
        bookId: '10000000-0000-4000-8000-000000000002',
        borrowDate: '2026-03-01',
        dueDate: '2026-03-05',
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'BOOK_NOT_AVAILABLE',
        },
      },
    });
  });

  it('returns a book and creates a fine when overdue', async () => {
    const created = await service.create({
      memberId: '20000000-0000-4000-8000-000000000001',
      bookId: '10000000-0000-4000-8000-000000000001',
      borrowDate: '2026-03-01',
      dueDate: '2026-03-05',
    });

    const response = await service.returnBook(created.data.id, {
      returnDate: '2026-03-10',
    });

    expect(response.success).toBe(true);
    expect(response.data.fineGenerated).toBe(true);
    expect(response.data.fineId).toBe('fine-001');
    expect(bookClient.incrementInventory).toHaveBeenCalled();
    expect(fineClient.createOverdueFine).toHaveBeenCalled();
  });
});
