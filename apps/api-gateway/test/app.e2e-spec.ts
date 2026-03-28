import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
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

interface GatewayErrorResponse {
  success: boolean;
  error: {
    code: string;
  };
  path: string;
}

interface SwaggerDocument {
  info: {
    title: string;
  };
  paths: Record<string, unknown>;
}

describe('ApiGateway gateway foundation (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  it('exposes Swagger docs endpoints', () => {
    return request(app.getHttpServer() as Server)
      .get('/docs-json')
      .expect(200)
      .expect(({ body }) => {
        const swaggerDocument = body as SwaggerDocument;

        expect(swaggerDocument.info.title).toBe('API Gateway');
        expect(swaggerDocument.paths['/health']).toBeDefined();
      });
  });
});
