import { Test, TestingModule } from '@nestjs/testing';
import { CategoryClient } from '../integrations/category.client';
import { BOOK_REPOSITORY } from './book.repository';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { BookStatus } from './enums/book-status.enum';
import { InMemoryBookRepository } from './in-memory-book.repository';

describe('BookService', () => {
  let service: BookService;
  let categoryClient: { validateCategory: jest.Mock };

  beforeEach(async () => {
    categoryClient = {
      validateCategory: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        InMemoryBookRepository,
        {
          provide: BOOK_REPOSITORY,
          useExisting: InMemoryBookRepository,
        },
        {
          provide: CategoryClient,
          useValue: categoryClient,
        },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
  });

  const createBookDto: CreateBookDto = {
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    isbn: '9780321125217',
    publishedYear: 2003,
    categoryId: '11111111-1111-1111-1111-111111111111',
    totalCopies: 3,
    availableCopies: 3,
    status: BookStatus.ACTIVE,
  };

  it('creates a book', async () => {
    const response = await service.create(createBookDto);

    expect(response.success).toBe(true);
    expect(response.data.title).toBe('Domain-Driven Design');
    expect(categoryClient.validateCategory).toHaveBeenCalledWith(
      createBookDto.categoryId,
    );
  });

  it('rejects invalid copy counts', async () => {
    await expect(
      service.create({
        ...createBookDto,
        isbn: '9780321125218',
        availableCopies: 4,
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'INVALID_COPY_COUNTS',
        },
      },
    });
  });

  it('decrements inventory and records adjustment data', async () => {
    const created = await service.create(createBookDto);

    const response = await service.decrementInventory(created.data.id, {
      reason: 'BORROW_CREATED',
      quantity: 1,
      referenceId: '22222222-2222-2222-2222-222222222222',
    });

    expect(response.success).toBe(true);
    expect(response.data.availableCopies).toBe(2);
    expect(response.data.adjustment.adjustmentType).toBe('DECREMENT');
    expect(response.data.adjustment.reason).toBe('BORROW_CREATED');
  });

  it('increments inventory without exceeding total copies', async () => {
    const created = await service.create(createBookDto);
    await service.decrementInventory(created.data.id, {
      reason: 'BORROW_CREATED',
      quantity: 1,
      referenceId: '22222222-2222-2222-2222-222222222222',
    });

    const response = await service.incrementInventory(created.data.id, {
      reason: 'BOOK_RETURNED',
      quantity: 1,
      referenceId: '33333333-3333-3333-3333-333333333333',
    });

    expect(response.success).toBe(true);
    expect(response.data.availableCopies).toBe(3);
    expect(response.data.adjustment.adjustmentType).toBe('INCREMENT');
  });
});
