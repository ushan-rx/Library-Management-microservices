import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { IncomingMessage, Server, ServerResponse, createServer } from 'http';
import request from 'supertest';
import { ApiGatewayModule } from './../src/api-gateway.module';
import { configureGatewayApp } from './../src/bootstrap';

interface GatewayHealthResponse {
  success: boolean;
  message: string;
  data: {
    service: string;
    status: string;
    publicRoutes: string[];
  };
}

interface EchoResponse {
  service: string;
  method: string;
  path: string;
  query: Record<string, string>;
  body: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
}

interface GatewayErrorResponse {
  success: boolean;
  error: {
    code: string;
  };
  path: string;
}

describe('ApiGateway route forwarding (e2e)', () => {
  let app: INestApplication;
  let authServer: Server;
  let memberServer: Server;
  let categoryServer: Server;
  let bookServer: Server;
  let borrowServer: Server;
  let fineServer: Server;
  let validToken: string;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'gateway-test-secret';
    process.env.AUTH_SERVICE_BASE_URL = 'http://127.0.0.1:4101';
    process.env.MEMBER_SERVICE_BASE_URL = 'http://127.0.0.1:4102';
    process.env.CATEGORY_SERVICE_BASE_URL = 'http://127.0.0.1:4103';
    process.env.BOOK_SERVICE_BASE_URL = 'http://127.0.0.1:4104';
    process.env.BORROW_SERVICE_BASE_URL = 'http://127.0.0.1:4105';
    process.env.FINE_PAYMENT_SERVICE_BASE_URL = 'http://127.0.0.1:4106';

    authServer = await startDownstreamServer(4101, 'auth-service');
    memberServer = await startDownstreamServer(4102, 'member-service');
    categoryServer = await startDownstreamServer(4103, 'category-service');
    bookServer = await startDownstreamServer(4104, 'book-service');
    borrowServer = await startDownstreamServer(4105, 'borrow-service');
    fineServer = await startDownstreamServer(4106, 'fine-payment-service');

    validToken = await new JwtService({
      secret: 'gateway-test-secret',
    }).signAsync({
      sub: 'user-123',
      role: 'LIBRARIAN',
      username: 'librarian01',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureGatewayApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    await Promise.all([
      closeServer(authServer),
      closeServer(memberServer),
      closeServer(categoryServer),
      closeServer(bookServer),
      closeServer(borrowServer),
      closeServer(fineServer),
    ]);
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer() as Server)
      .get('/health')
      .expect(200)
      .expect(({ body, headers }) => {
        const responseBody = body as GatewayHealthResponse;

        expect(responseBody.success).toBe(true);
        expect(responseBody.message).toBe('Gateway healthy');
        expect(responseBody.data.service).toBe('api-gateway');
        expect(responseBody.data.status).toBe('UP');
        expect(responseBody.data.publicRoutes).toContain('/health');
        expect(headers['x-correlation-id']).toBeDefined();
      });
  });

  it('forwards public auth routes without requiring a token', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({
        login: 'librarian01',
        password: 'StrongPassword123',
      })
      .expect(200);

    const responseBody = response.body as EchoResponse;
    expect(responseBody.service).toBe('auth-service');
    expect(responseBody.path).toBe('/auth/login');
    expect(responseBody.body.login).toBe('librarian01');
  });

  it('blocks protected routes without a token', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/members')
      .expect(401);

    const responseBody = response.body as GatewayErrorResponse;
    expect(responseBody.error.code).toBe('UNAUTHORIZED');
  });

  it('forwards protected routes with user context, query params, and correlation id', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/members?page=2&limit=5')
      .set('Authorization', `Bearer ${validToken}`)
      .set('x-correlation-id', 'corr-forward-123')
      .expect(200);

    const responseBody = response.body as EchoResponse;
    expect(responseBody.service).toBe('member-service');
    expect(responseBody.query.page).toBe('2');
    expect(responseBody.query.limit).toBe('5');
    expect(responseBody.headers['x-user-id']).toBe('user-123');
    expect(responseBody.headers['x-user-role']).toBe('LIBRARIAN');
    expect(responseBody.headers['x-username']).toBe('librarian01');
    expect(responseBody.headers['x-correlation-id']).toBe('corr-forward-123');
  });

  it('maps all configured route groups to their downstream services', async () => {
    await assertForwardedService(
      app,
      '/categories',
      validToken,
      'category-service',
    );
    await assertForwardedService(app, '/books', validToken, 'book-service');
    await assertForwardedService(app, '/borrows', validToken, 'borrow-service');
    await assertForwardedService(
      app,
      '/fines',
      validToken,
      'fine-payment-service',
    );
  });

  it('normalizes unmatched routes', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/missing')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);

    const responseBody = response.body as GatewayErrorResponse;
    expect(responseBody.error.code).toBe('ROUTE_NOT_FOUND');
    expect(responseBody.path).toBe('/missing');
  });

  it('translates upstream unavailable failures', async () => {
    process.env.BOOK_SERVICE_BASE_URL = 'http://127.0.0.1:4199';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    const failingApp = moduleFixture.createNestApplication();
    configureGatewayApp(failingApp);
    await failingApp.init();

    const response = await request(failingApp.getHttpServer() as Server)
      .get('/books')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(503);

    const responseBody = response.body as GatewayErrorResponse;
    expect(responseBody.error.code).toBe('UPSTREAM_UNAVAILABLE');

    await failingApp.close();
  });
});

async function assertForwardedService(
  app: INestApplication,
  path: string,
  token: string,
  expectedService: string,
) {
  const response = await request(app.getHttpServer() as Server)
    .get(path)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  const responseBody = response.body as EchoResponse;
  expect(responseBody.service).toBe(expectedService);
}

async function startDownstreamServer(
  port: number,
  serviceName: string,
): Promise<Server> {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    void handleDownstreamRequest(req, res, port, serviceName);
  });

  await new Promise<void>((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve());
  });

  return server;
}

async function handleDownstreamRequest(
  req: IncomingMessage,
  res: ServerResponse,
  port: number,
  serviceName: string,
): Promise<void> {
  const requestUrl = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
  const body = await readJsonBody(req);

  res.statusCode = 200;
  res.setHeader('content-type', 'application/json');
  res.end(
    JSON.stringify({
      service: serviceName,
      method: req.method,
      path: requestUrl.pathname,
      query: Object.fromEntries(requestUrl.searchParams.entries()),
      body,
      headers: req.headers,
    }),
  );
}

async function readJsonBody(
  request: IncomingMessage,
): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(
      Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array),
    );
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString()) as Record<
    string,
    unknown
  >;
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
