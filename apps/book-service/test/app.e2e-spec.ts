import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { configureBookServiceApp } from '../src/bootstrap';
import { BookServiceModule } from '../src/book-service.module';

interface SuccessResponse<T> {
  success: boolean;
  data: T;
}

interface BookSummary {
  id: string;
  availableCopies: number;
  status: string;
}

interface BookDetails extends BookSummary {
  title: string;
}

interface BookListData {
  items: BookDetails[];
  pagination: {
    totalItems: number;
  };
}

interface AvailabilityData {
  exists: boolean;
  available: boolean;
  availableCopies: number;
}

interface InventoryResponseData {
  availableCopies: number;
  adjustment: {
    adjustmentType: string;
    reason: string;
  };
}

interface HealthData {
  service: string;
}

describe('Book service (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.BOOK_STORAGE_DRIVER = 'memory';
    process.env.BOOK_VALIDATE_CATEGORY_ON_WRITE = 'false';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BookServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureBookServiceApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates, lists, checks availability, and adjusts inventory', async () => {
    const createResponse = await request(app.getHttpServer() as Server)
      .post('/books')
      .set('x-user-role', 'LIBRARIAN')
      .send({
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        publishedYear: 2008,
        categoryId: '11111111-1111-4111-8111-111111111111',
        totalCopies: 5,
        availableCopies: 5,
        status: 'ACTIVE',
      })
      .expect(201);

    const createBody = createResponse.body as SuccessResponse<BookSummary>;
    const bookId = createBody.data.id;

    const listResponse = await request(app.getHttpServer() as Server)
      .get('/books')
      .query({ search: 'Clean', availableOnly: 'true' })
      .expect(200);

    const listBody = listResponse.body as SuccessResponse<BookListData>;
    expect(listBody.data.pagination.totalItems).toBe(1);
    expect(listBody.data.items[0].id).toBe(bookId);

    const availabilityResponse = await request(app.getHttpServer() as Server)
      .get(`/books/${bookId}/availability`)
      .expect(200);

    const availabilityBody =
      availabilityResponse.body as SuccessResponse<AvailabilityData>;
    expect(availabilityBody.data.exists).toBe(true);
    expect(availabilityBody.data.available).toBe(true);

    const decrementResponse = await request(app.getHttpServer() as Server)
      .post(`/books/${bookId}/inventory/decrement`)
      .set('x-user-role', 'LIBRARIAN')
      .send({
        reason: 'BORROW_CREATED',
        quantity: 2,
        referenceId: '22222222-2222-4222-8222-222222222222',
      })
      .expect(200);

    const decrementBody =
      decrementResponse.body as SuccessResponse<InventoryResponseData>;
    expect(decrementBody.data.availableCopies).toBe(3);
    expect(decrementBody.data.adjustment.adjustmentType).toBe('DECREMENT');

    await request(app.getHttpServer() as Server)
      .post(`/books/${bookId}/inventory/decrement`)
      .set('x-user-role', 'LIBRARIAN')
      .send({
        reason: 'BORROW_CREATED',
        quantity: 4,
      })
      .expect(409);

    const incrementResponse = await request(app.getHttpServer() as Server)
      .post(`/books/${bookId}/inventory/increment`)
      .set('x-user-role', 'LIBRARIAN')
      .send({
        reason: 'BOOK_RETURNED',
        quantity: 1,
        referenceId: '33333333-3333-4333-8333-333333333333',
      })
      .expect(200);

    const incrementBody =
      incrementResponse.body as SuccessResponse<InventoryResponseData>;
    expect(incrementBody.data.availableCopies).toBe(4);
    expect(incrementBody.data.adjustment.reason).toBe('BOOK_RETURNED');
  });

  it('exposes the health endpoint', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/books/health')
      .expect(200);

    const body = response.body as SuccessResponse<HealthData>;
    expect(body.success).toBe(true);
    expect(body.data.service).toBe('book-service');
  });
});
