import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { configureCategoryServiceApp } from '../src/bootstrap';
import { CategoryServiceModule } from '../src/category-service.module';

interface SuccessResponse<T> {
  success: boolean;
  data: T;
}

interface CategorySummary {
  id: string;
  status: string;
}

interface CategoryDetails extends CategorySummary {
  description: string | null;
}

interface CategoryListData {
  items: Array<{
    id: string;
    name: string;
  }>;
  pagination: {
    totalItems: number;
  };
}

interface ExistenceData {
  exists: boolean;
  active: boolean;
}

interface HealthData {
  service: string;
}

describe('Category service (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.CATEGORY_STORAGE_DRIVER = 'memory';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CategoryServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureCategoryServiceApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates, lists, updates, checks existence, and deactivates categories', async () => {
    const createResponse = await request(app.getHttpServer() as Server)
      .post('/categories')
      .set('x-user-role', 'LIBRARIAN')
      .send({
        name: 'Computer Science',
        description: 'Books related to computing',
      })
      .expect(201);

    const createBody = createResponse.body as SuccessResponse<CategorySummary>;
    const categoryId = createBody.data.id;

    await request(app.getHttpServer() as Server)
      .post('/categories')
      .set('x-user-role', 'LIBRARIAN')
      .send({
        name: 'computer science',
      })
      .expect(409);

    const listResponse = await request(app.getHttpServer() as Server)
      .get('/categories')
      .query({ search: 'Science' })
      .expect(200);

    const listBody = listResponse.body as SuccessResponse<CategoryListData>;
    expect(listBody.data.pagination.totalItems).toBe(1);
    expect(listBody.data.items[0].id).toBe(categoryId);

    const updateResponse = await request(app.getHttpServer() as Server)
      .put(`/categories/${categoryId}`)
      .set('x-user-role', 'LIBRARIAN')
      .send({
        description: 'Updated category description',
      })
      .expect(200);

    const updateBody = updateResponse.body as SuccessResponse<CategoryDetails>;
    expect(updateBody.data.description).toBe('Updated category description');

    const existenceResponse = await request(app.getHttpServer() as Server)
      .get(`/categories/${categoryId}/existence`)
      .expect(200);

    const existenceBody =
      existenceResponse.body as SuccessResponse<ExistenceData>;
    expect(existenceBody.data.exists).toBe(true);
    expect(existenceBody.data.active).toBe(true);

    await request(app.getHttpServer() as Server)
      .delete(`/categories/${categoryId}`)
      .set('x-user-role', 'LIBRARIAN')
      .expect(403);

    const deleteResponse = await request(app.getHttpServer() as Server)
      .delete(`/categories/${categoryId}`)
      .set('x-user-role', 'ADMIN')
      .expect(200);

    const deleteBody = deleteResponse.body as SuccessResponse<CategorySummary>;
    expect(deleteBody.data.status).toBe('INACTIVE');

    const deletedExistenceResponse = await request(
      app.getHttpServer() as Server,
    )
      .get(`/categories/${categoryId}/existence`)
      .expect(200);

    const deletedExistenceBody =
      deletedExistenceResponse.body as SuccessResponse<ExistenceData>;
    expect(deletedExistenceBody.data.exists).toBe(true);
    expect(deletedExistenceBody.data.active).toBe(false);
  });

  it('exposes the health endpoint', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/categories/health')
      .expect(200);

    const body = response.body as SuccessResponse<HealthData>;
    expect(body.success).toBe(true);
    expect(body.data.service).toBe('category-service');
  });
});
