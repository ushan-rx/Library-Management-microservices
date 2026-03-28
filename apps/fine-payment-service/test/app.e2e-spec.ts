import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { configureFinePaymentServiceApp } from '../src/bootstrap';
import { FinePaymentServiceModule } from '../src/fine-payment-service.module';

interface SuccessResponse<T> {
  success: boolean;
  data: T;
}

interface FineSummary {
  id: string;
  status: string;
}

interface FineListData {
  items: FineSummary[];
  pagination: {
    totalItems: number;
  };
}

interface FinePaymentResponseData {
  fineStatus: string;
  paymentId: string;
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

describe('Fine payment service (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.FINE_STORAGE_DRIVER = 'memory';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FinePaymentServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureFinePaymentServiceApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates fines, prevents duplicates, records payments, and supports lookup routes', async () => {
    const createResponse = await request(app.getHttpServer() as Server)
      .post('/fines')
      .set('x-user-role', 'LIBRARIAN')
      .send({
        memberId: '20000000-0000-4000-8000-000000000001',
        borrowId: '30000000-0000-4000-8000-000000000001',
        amount: 500,
        reason: 'OVERDUE_RETURN',
        status: 'PENDING',
      })
      .expect(201);

    const createBody = createResponse.body as SuccessResponse<FineSummary>;
    const fineId = createBody.data.id;

    await request(app.getHttpServer() as Server)
      .post('/fines')
      .set('x-user-role', 'LIBRARIAN')
      .send({
        memberId: '20000000-0000-4000-8000-000000000001',
        borrowId: '30000000-0000-4000-8000-000000000001',
        amount: 500,
        reason: 'OVERDUE_RETURN',
        status: 'PENDING',
      })
      .expect(409);

    const listResponse = await request(app.getHttpServer() as Server)
      .get('/fines')
      .query({ memberId: '20000000-0000-4000-8000-000000000001' })
      .expect(200);

    const listBody = listResponse.body as SuccessResponse<FineListData>;
    expect(listBody.data.pagination.totalItems).toBe(1);

    await request(app.getHttpServer() as Server)
      .get('/fines/borrow/30000000-0000-4000-8000-000000000001')
      .expect(200);

    await request(app.getHttpServer() as Server)
      .get('/fines/member/20000000-0000-4000-8000-000000000001')
      .expect(200);

    const paymentResponse = await request(app.getHttpServer() as Server)
      .post(`/fines/${fineId}/payments`)
      .set('x-user-role', 'LIBRARIAN')
      .set('x-user-id', '99999999-0000-4000-8000-000000000001')
      .send({
        amount: 500,
        paymentMethod: 'CASH',
        paymentDate: '2026-03-28',
      })
      .expect(201);

    const paymentBody =
      paymentResponse.body as SuccessResponse<FinePaymentResponseData>;
    expect(paymentBody.data.fineStatus).toBe('PAID');
    expect(paymentBody.data.paymentId).toEqual(expect.any(String));
  });

  it('exposes the health endpoint', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/fines/health')
      .expect(200);

    const body = response.body as SuccessResponse<HealthData>;
    expect(body.success).toBe(true);
    expect(body.data.service).toBe('fine-payment-service');
  });

  it('exposes Swagger docs endpoints', async () => {
    await request(app.getHttpServer() as Server)
      .get('/docs-json')
      .expect(200)
      .expect(({ body }) => {
        const swaggerDocument = body as SwaggerDocument;

        expect(swaggerDocument.info.title).toBe('Fine Payment Service');
        expect(swaggerDocument.paths['/fines']).toBeDefined();
      });

    await request(app.getHttpServer() as Server)
      .get('/docs')
      .expect(200);
  });
});
