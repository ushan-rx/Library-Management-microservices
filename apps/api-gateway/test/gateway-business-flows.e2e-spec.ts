import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { AddressInfo } from 'net';
import request from 'supertest';
import { ApiGatewayModule } from '../src/api-gateway.module';
import { configureGatewayApp } from '../src/bootstrap';
import { AuthServiceModule } from '../../auth-service/src/auth-service.module';
import { configureAuthServiceApp } from '../../auth-service/src/bootstrap';
import { MemberServiceModule } from '../../member-service/src/member-service.module';
import { configureMemberServiceApp } from '../../member-service/src/bootstrap';
import { CategoryServiceModule } from '../../category-service/src/category-service.module';
import { configureCategoryServiceApp } from '../../category-service/src/bootstrap';
import { BookServiceModule } from '../../book-service/src/book-service.module';
import { configureBookServiceApp } from '../../book-service/src/bootstrap';
import { BorrowServiceModule } from '../../borrow-service/src/borrow-service.module';
import { configureBorrowServiceApp } from '../../borrow-service/src/bootstrap';
import { FinePaymentServiceModule } from '../../fine-payment-service/src/fine-payment-service.module';
import { configureFinePaymentServiceApp } from '../../fine-payment-service/src/bootstrap';

interface SuccessResponse<T> {
  success: boolean;
  data: T;
}

interface LoginResponseData {
  accessToken: string;
  user: {
    id: string;
    role: string;
  };
}

interface IdResponseData {
  id: string;
}

interface BorrowResponseData {
  id: string;
  status: string;
}

interface ReturnResponseData {
  status: string;
  fineGenerated: boolean;
  fineId: string | null;
}

interface FinePaymentResponseData {
  fineStatus: string;
}

interface ErrorResponse {
  error: {
    code: string;
  };
}

interface ProfileResponseData {
  role: string;
}

interface AvailabilityResponseData {
  availableCopies: number;
}

interface FineLookupResponseData {
  amount: number;
  status: string;
}

async function startApplication(
  imports: unknown[],
  configureApp: (app: INestApplication) => void,
): Promise<{ app: INestApplication; baseUrl: string }> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports,
  }).compile();

  const app = moduleFixture.createNestApplication();
  configureApp(app);
  await app.listen(0, '127.0.0.1');

  const httpServer = app.getHttpServer() as Server & {
    address(): AddressInfo | string | null;
  };
  const address = httpServer.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to resolve app address');
  }

  return {
    app,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

describe('Gateway business flows (e2e)', () => {
  const startedApps: INestApplication[] = [];
  let gatewayApp: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'phase-12-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.AUTH_STORAGE_DRIVER = 'memory';
    process.env.MEMBER_STORAGE_DRIVER = 'memory';
    process.env.CATEGORY_STORAGE_DRIVER = 'memory';
    process.env.BOOK_STORAGE_DRIVER = 'memory';
    process.env.BOOK_VALIDATE_CATEGORY_ON_WRITE = 'true';
    process.env.BORROW_STORAGE_DRIVER = 'memory';
    process.env.BORROW_FINE_AMOUNT_PER_DAY = '100';
    process.env.FINE_STORAGE_DRIVER = 'memory';

    const auth = await startApplication(
      [AuthServiceModule],
      configureAuthServiceApp,
    );
    startedApps.push(auth.app);
    process.env.AUTH_SERVICE_BASE_URL = auth.baseUrl;

    const member = await startApplication(
      [MemberServiceModule],
      configureMemberServiceApp,
    );
    startedApps.push(member.app);
    process.env.MEMBER_SERVICE_BASE_URL = member.baseUrl;

    const category = await startApplication(
      [CategoryServiceModule],
      configureCategoryServiceApp,
    );
    startedApps.push(category.app);
    process.env.CATEGORY_SERVICE_BASE_URL = category.baseUrl;

    const book = await startApplication(
      [BookServiceModule],
      configureBookServiceApp,
    );
    startedApps.push(book.app);
    process.env.BOOK_SERVICE_BASE_URL = book.baseUrl;

    const fine = await startApplication(
      [FinePaymentServiceModule],
      configureFinePaymentServiceApp,
    );
    startedApps.push(fine.app);
    process.env.FINE_PAYMENT_SERVICE_BASE_URL = fine.baseUrl;

    const borrow = await startApplication(
      [BorrowServiceModule],
      configureBorrowServiceApp,
    );
    startedApps.push(borrow.app);
    process.env.BORROW_SERVICE_BASE_URL = borrow.baseUrl;

    const gateway = await startApplication(
      [ApiGatewayModule],
      configureGatewayApp,
    );
    startedApps.push(gateway.app);
    gatewayApp = gateway.app;
  });

  afterAll(async () => {
    await Promise.all(
      startedApps.reverse().map(async (app) => {
        await app.close();
      }),
    );
  });

  it('rejects protected routes without a bearer token', async () => {
    await request(gatewayApp.getHttpServer() as Server)
      .get('/members')
      .expect(401)
      .expect(({ body }) => {
        const errorBody = body as ErrorResponse;

        expect(errorBody.error.code).toBe('UNAUTHORIZED');
      });
  });

  it('runs the librarian workflow through the gateway', async () => {
    await request(gatewayApp.getHttpServer() as Server)
      .post('/auth/register')
      .send({
        username: 'librarian',
        email: 'librarian@library.local',
        password: 'Librarian123',
        role: 'LIBRARIAN',
      })
      .expect(201);

    const loginResponse = await request(gatewayApp.getHttpServer() as Server)
      .post('/auth/login')
      .send({
        login: 'librarian@library.local',
        password: 'Librarian123',
      })
      .expect(200);

    const loginBody = loginResponse.body as SuccessResponse<LoginResponseData>;
    const accessToken = loginBody.data.accessToken;

    await request(gatewayApp.getHttpServer() as Server)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        const profileBody = body as SuccessResponse<ProfileResponseData>;

        expect(profileBody.data.role).toBe('LIBRARIAN');
      });

    const categoryResponse = await request(gatewayApp.getHttpServer() as Server)
      .post('/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Technology',
        description: 'Technology and computing books',
      })
      .expect(201);

    const categoryBody =
      categoryResponse.body as SuccessResponse<IdResponseData>;

    const bookResponse = await request(gatewayApp.getHttpServer() as Server)
      .post('/books')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Domain-Driven Design',
        author: 'Eric Evans',
        isbn: '9780321125217',
        publishedYear: 2003,
        categoryId: categoryBody.data.id,
        totalCopies: 2,
        availableCopies: 2,
        status: 'ACTIVE',
      })
      .expect(201);

    const bookBody = bookResponse.body as SuccessResponse<IdResponseData>;

    const memberResponse = await request(gatewayApp.getHttpServer() as Server)
      .post('/members')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        fullName: 'Nimal Perera',
        email: 'nimal@example.com',
        phone: '+94771234567',
        address: 'Colombo',
        membershipStatus: 'ACTIVE',
      })
      .expect(201);

    const memberBody = memberResponse.body as SuccessResponse<IdResponseData>;

    const borrowResponse = await request(gatewayApp.getHttpServer() as Server)
      .post('/borrows')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        memberId: memberBody.data.id,
        bookId: bookBody.data.id,
        borrowDate: '2026-03-01',
        dueDate: '2026-03-05',
      })
      .expect(201);

    const borrowBody =
      borrowResponse.body as SuccessResponse<BorrowResponseData>;
    expect(borrowBody.data.status).toBe('BORROWED');

    await request(gatewayApp.getHttpServer() as Server)
      .get(`/books/${bookBody.data.id}/availability`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        const availabilityBody =
          body as SuccessResponse<AvailabilityResponseData>;

        expect(availabilityBody.data.availableCopies).toBe(1);
      });

    const returnResponse = await request(gatewayApp.getHttpServer() as Server)
      .post(`/borrows/${borrowBody.data.id}/return`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        returnDate: '2026-03-10',
      })
      .expect(200);

    const returnBody =
      returnResponse.body as SuccessResponse<ReturnResponseData>;
    expect(returnBody.data.status).toBe('RETURNED');
    expect(returnBody.data.fineGenerated).toBe(true);
    expect(returnBody.data.fineId).toEqual(expect.any(String));

    await request(gatewayApp.getHttpServer() as Server)
      .get(`/fines/borrow/${borrowBody.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        const fineBody = body as SuccessResponse<FineLookupResponseData>;

        expect(fineBody.data.amount).toBe(500);
        expect(fineBody.data.status).toBe('PENDING');
      });

    const paymentResponse = await request(gatewayApp.getHttpServer() as Server)
      .post(`/fines/${returnBody.data.fineId}/payments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: 500,
        paymentMethod: 'CASH',
        paymentDate: '2026-03-28',
      })
      .expect(201);

    const paymentBody =
      paymentResponse.body as SuccessResponse<FinePaymentResponseData>;
    expect(paymentBody.data.fineStatus).toBe('PAID');
  });

  it('preserves downstream role-based protection through the gateway', async () => {
    await request(gatewayApp.getHttpServer() as Server)
      .post('/auth/register')
      .send({
        username: 'member01',
        email: 'member01@library.local',
        password: 'Member12345',
        role: 'MEMBER',
      })
      .expect(201);

    const loginResponse = await request(gatewayApp.getHttpServer() as Server)
      .post('/auth/login')
      .send({
        login: 'member01@library.local',
        password: 'Member12345',
      })
      .expect(200);

    const loginBody = loginResponse.body as SuccessResponse<LoginResponseData>;

    await request(gatewayApp.getHttpServer() as Server)
      .post('/categories')
      .set('Authorization', `Bearer ${loginBody.data.accessToken}`)
      .send({
        name: 'History',
      })
      .expect(403)
      .expect(({ body }) => {
        const errorBody = body as ErrorResponse;

        expect(errorBody.error.code).toBe('FORBIDDEN');
      });
  });
});
