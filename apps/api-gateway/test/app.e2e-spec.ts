import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
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

interface GatewayErrorResponse {
  success: boolean;
  error: {
    code: string;
  };
  path: string;
}

describe('ApiGateway gateway foundation (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-gateway-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get(JwtService);
    configureGatewayApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
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

  it('propagates an incoming x-correlation-id header', () => {
    return request(app.getHttpServer() as Server)
      .get('/health')
      .set('x-correlation-id', 'test-correlation-id')
      .expect(200)
      .expect(({ headers }) => {
        expect(headers['x-correlation-id']).toBe('test-correlation-id');
      });
  });

  it('normalizes not found routes', () => {
    return request(app.getHttpServer() as Server)
      .get('/missing')
      .expect(404)
      .expect(({ body, headers }) => {
        const responseBody = body as GatewayErrorResponse;

        expect(responseBody.success).toBe(false);
        expect(responseBody.error.code).toBe('ROUTE_NOT_FOUND');
        expect(responseBody.path).toBe('/missing');
        expect(headers['x-correlation-id']).toBeDefined();
      });
  });

  it('rejects protected route groups without a token', () => {
    return request(app.getHttpServer() as Server)
      .get('/members')
      .expect(401)
      .expect(({ body }) => {
        const responseBody = body as GatewayErrorResponse;

        expect(responseBody.success).toBe(false);
        expect(responseBody.error.code).toBe('UNAUTHORIZED');
      });
  });

  it('rejects protected route groups with an invalid token', () => {
    return request(app.getHttpServer() as Server)
      .get('/members')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401)
      .expect(({ body }) => {
        const responseBody = body as GatewayErrorResponse;

        expect(responseBody.success).toBe(false);
        expect(responseBody.error.code).toBe('UNAUTHORIZED');
      });
  });

  it('allows valid tokens through protected route groups', () => {
    const accessToken = jwtService.sign({
      sub: 'user-123',
      username: 'librarian01',
      email: 'librarian01@example.com',
      role: 'LIBRARIAN',
    });

    return request(app.getHttpServer() as Server)
      .get('/members')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404)
      .expect(({ body }) => {
        const responseBody = body as GatewayErrorResponse;

        expect(responseBody.error.code).toBe('ROUTE_NOT_FOUND');
      });
  });

  it('keeps public auth routes accessible without a token', () => {
    return request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({})
      .expect(404)
      .expect(({ body }) => {
        const responseBody = body as GatewayErrorResponse;

        expect(responseBody.error.code).toBe('ROUTE_NOT_FOUND');
      });
  });
});
