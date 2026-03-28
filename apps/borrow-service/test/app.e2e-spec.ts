import {
  ConflictException,
  ForbiddenException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { BorrowServiceModule } from '../src/borrow-service.module';
import { configureBorrowServiceApp } from '../src/bootstrap';
import { BookClient } from '../src/integrations/book.client';
import { FineClient } from '../src/integrations/fine.client';
import { MemberClient } from '../src/integrations/member.client';

interface SuccessResponse<T> {
  success: boolean;
  data: T;
}

interface BorrowSummary {
  id: string;
  status: string;
}

interface ReturnResponseData {
  fineGenerated: boolean;
  fineId: string | null;
}

interface OverdueData {
  overdue: boolean;
  daysOverdue: number;
}

interface HealthData {
  service: string;
}

interface SwaggerDocument {
  info: {
    title: string;
  };
  paths: Record<string, unknown>;
}

describe('Borrow service (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.BORROW_STORAGE_DRIVER = 'memory';
    process.env.BORROW_FINE_AMOUNT_PER_DAY = '100';

    const memberClient = {
      validateBorrowEligibility: jest
        .fn()
        .mockImplementation((memberId: string) => {
          if (memberId === '00000000-0000-4000-8000-000000000404') {
            throw new NotFoundException({
              success: false,
              message: 'Member not found',
              error: { code: 'MEMBER_NOT_FOUND', details: [] },
            });
          }

          if (memberId === '00000000-0000-4000-8000-000000000403') {
            throw new ForbiddenException({
              success: false,
              message: 'Member is not eligible to borrow',
              error: { code: 'MEMBER_NOT_ELIGIBLE', details: [] },
            });
          }

          return Promise.resolve();
        }),
    };

    const inventory = new Map<string, number>([
      ['10000000-0000-4000-8000-000000000001', 2],
      ['10000000-0000-4000-8000-000000000002', 0],
    ]);

    const bookClient = {
      validateAvailability: jest.fn().mockImplementation((bookId: string) => {
        const copies = inventory.get(bookId);
        if (copies === undefined) {
          throw new NotFoundException({
            success: false,
            message: 'Book not found',
            error: { code: 'BOOK_NOT_FOUND', details: [] },
          });
        }

        if (copies <= 0) {
          throw new ConflictException({
            success: false,
            message: 'Book is not available',
            error: { code: 'BOOK_NOT_AVAILABLE', details: [] },
          });
        }

        return Promise.resolve();
      }),
      decrementInventory: jest.fn().mockImplementation((bookId: string) => {
        inventory.set(bookId, (inventory.get(bookId) ?? 0) - 1);
        return Promise.resolve();
      }),
      incrementInventory: jest.fn().mockImplementation((bookId: string) => {
        inventory.set(bookId, (inventory.get(bookId) ?? 0) + 1);
        return Promise.resolve();
      }),
    };

    const fineClient = {
      createOverdueFine: jest.fn().mockResolvedValue('fine-uuid-001'),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BorrowServiceModule],
    })
      .overrideProvider(MemberClient)
      .useValue(memberClient)
      .overrideProvider(BookClient)
      .useValue(bookClient)
      .overrideProvider(FineClient)
      .useValue(fineClient)
      .compile();

    app = moduleFixture.createNestApplication();
    configureBorrowServiceApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates borrows, rejects invalid cases, and returns overdue books with fines', async () => {
    const borrowResponse = await request(app.getHttpServer() as Server)
      .post('/borrows')
      .set('x-user-role', 'LIBRARIAN')
      .set('x-user-id', '99999999-0000-4000-8000-000000000001')
      .send({
        memberId: '20000000-0000-4000-8000-000000000001',
        bookId: '10000000-0000-4000-8000-000000000001',
        borrowDate: '2026-03-01',
        dueDate: '2026-03-05',
      })
      .expect(201);

    const borrowBody = borrowResponse.body as SuccessResponse<BorrowSummary>;
    expect(borrowBody.data.status).toBe('BORROWED');

    await request(app.getHttpServer() as Server)
      .post('/borrows')
      .set('x-user-role', 'LIBRARIAN')
      .send({
        memberId: '00000000-0000-4000-8000-000000000403',
        bookId: '10000000-0000-4000-8000-000000000001',
        borrowDate: '2026-03-01',
        dueDate: '2026-03-05',
      })
      .expect(403);

    await request(app.getHttpServer() as Server)
      .post('/borrows')
      .set('x-user-role', 'LIBRARIAN')
      .send({
        memberId: '20000000-0000-4000-8000-000000000001',
        bookId: '10000000-0000-4000-8000-000000000002',
        borrowDate: '2026-03-01',
        dueDate: '2026-03-05',
      })
      .expect(409);

    const overdueResponse = await request(app.getHttpServer() as Server)
      .get(`/borrows/${borrowBody.data.id}/overdue-status`)
      .expect(200);

    const overdueBody = overdueResponse.body as SuccessResponse<OverdueData>;
    expect(overdueBody.data.overdue).toBe(true);
    expect(overdueBody.data.daysOverdue).toBeGreaterThan(0);

    const returnResponse = await request(app.getHttpServer() as Server)
      .post(`/borrows/${borrowBody.data.id}/return`)
      .set('x-user-role', 'LIBRARIAN')
      .set('x-user-id', '99999999-0000-4000-8000-000000000001')
      .send({
        returnDate: '2026-03-10',
      })
      .expect(200);

    const returnBody =
      returnResponse.body as SuccessResponse<ReturnResponseData>;
    expect(returnBody.data.fineGenerated).toBe(true);
    expect(returnBody.data.fineId).toBe('fine-uuid-001');

    await request(app.getHttpServer() as Server)
      .post(`/borrows/${borrowBody.data.id}/return`)
      .set('x-user-role', 'LIBRARIAN')
      .send({
        returnDate: '2026-03-10',
      })
      .expect(409);
  });

  it('exposes the health endpoint', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/borrows/health')
      .expect(200);

    const body = response.body as SuccessResponse<HealthData>;
    expect(body.success).toBe(true);
    expect(body.data.service).toBe('borrow-service');
  });

  it('exposes Swagger docs endpoints', async () => {
    await request(app.getHttpServer() as Server)
      .get('/docs-json')
      .expect(200)
      .expect(({ body }) => {
        const swaggerDocument = body as SwaggerDocument;

        expect(swaggerDocument.info.title).toBe('Borrow Service');
        expect(swaggerDocument.paths['/borrows']).toBeDefined();
      });

    await request(app.getHttpServer() as Server)
      .get('/docs')
      .expect(200);
  });
});
