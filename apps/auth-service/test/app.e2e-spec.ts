import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { AuthServiceModule } from './../src/auth-service.module';
import { configureAuthServiceApp } from './../src/bootstrap';

interface AuthSuccessResponse<T> {
  success: boolean;
  data: T;
}

interface RegisterResponseData {
  email: string;
  role: string;
}

interface LoginResponseData {
  accessToken: string;
  tokenType: string;
}

interface ProfileResponseData {
  email: string;
  status: string;
}

interface ValidateResponseData {
  valid: boolean;
  user: {
    username: string;
  };
}

interface HealthResponseData {
  service: string;
}

interface SwaggerDocument {
  info: {
    title: string;
  };
  paths: Record<string, unknown>;
}

describe('Auth service (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.AUTH_STORAGE_DRIVER = 'memory';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureAuthServiceApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a user', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send({
        username: 'librarian01',
        email: 'librarian01@example.com',
        password: 'StrongPassword123',
        role: 'LIBRARIAN',
      })
      .expect(201);

    const responseBody =
      response.body as AuthSuccessResponse<RegisterResponseData>;

    expect(responseBody.success).toBe(true);
    expect(responseBody.data.email).toBe('librarian01@example.com');
    expect(responseBody.data.role).toBe('LIBRARIAN');
  });

  it('logs in and returns a bearer token', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({
        login: 'librarian01@example.com',
        password: 'StrongPassword123',
      })
      .expect(200);

    const responseBody =
      response.body as AuthSuccessResponse<LoginResponseData>;

    expect(responseBody.success).toBe(true);
    expect(responseBody.data.accessToken).toEqual(expect.any(String));
    expect(responseBody.data.tokenType).toBe('Bearer');
  });

  it('returns the authenticated profile', async () => {
    const loginResponse = await request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({
        login: 'librarian01@example.com',
        password: 'StrongPassword123',
      })
      .expect(200);

    const loginBody =
      loginResponse.body as AuthSuccessResponse<LoginResponseData>;
    const profileResponse = await request(app.getHttpServer() as Server)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${loginBody.data.accessToken}`)
      .expect(200);

    const profileBody =
      profileResponse.body as AuthSuccessResponse<ProfileResponseData>;

    expect(profileBody.success).toBe(true);
    expect(profileBody.data.email).toBe('librarian01@example.com');
    expect(profileBody.data.status).toBe('ACTIVE');
  });

  it('validates a token', async () => {
    const loginResponse = await request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({
        login: 'librarian01@example.com',
        password: 'StrongPassword123',
      })
      .expect(200);

    const loginBody =
      loginResponse.body as AuthSuccessResponse<LoginResponseData>;
    const validationResponse = await request(app.getHttpServer() as Server)
      .post('/auth/validate')
      .send({
        token: loginBody.data.accessToken,
      })
      .expect(200);

    const validationBody =
      validationResponse.body as AuthSuccessResponse<ValidateResponseData>;

    expect(validationBody.success).toBe(true);
    expect(validationBody.data.valid).toBe(true);
    expect(validationBody.data.user.username).toBe('librarian01');
  });

  it('exposes the health endpoint', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/auth/health')
      .expect(200);

    const responseBody =
      response.body as AuthSuccessResponse<HealthResponseData>;

    expect(responseBody.success).toBe(true);
    expect(responseBody.data.service).toBe('auth-service');
  });

  it('exposes Swagger docs endpoints', async () => {
    await request(app.getHttpServer() as Server)
      .get('/docs-json')
      .expect(200)
      .expect(({ body }) => {
        const swaggerDocument = body as SwaggerDocument;

        expect(swaggerDocument.info.title).toBe('Auth Service');
        expect(swaggerDocument.paths['/auth/login']).toBeDefined();
      });

    await request(app.getHttpServer() as Server)
      .get('/docs')
      .expect(200);
  });
});
