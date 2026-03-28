import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { configureMemberServiceApp } from '../src/bootstrap';
import { MemberServiceModule } from '../src/member-service.module';

interface SuccessResponse<T> {
  success: boolean;
  data: T;
}

interface MemberSummary {
  id: string;
  membershipStatus: string;
}

interface MemberDetails extends MemberSummary {
  fullName: string;
}

interface MemberListData {
  items: MemberDetails[];
  pagination: {
    totalItems: number;
  };
}

interface EligibilityData {
  eligibleToBorrow: boolean;
  membershipStatus: string | null;
}

interface HealthData {
  service: string;
}

describe('Member service (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.MEMBER_STORAGE_DRIVER = 'memory';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MemberServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureMemberServiceApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates, lists, updates, checks eligibility, and deletes members', async () => {
    const createResponse = await request(app.getHttpServer() as Server)
      .post('/members')
      .set('x-user-role', 'LIBRARIAN')
      .send({
        fullName: 'Nimal Perera',
        email: 'nimal@example.com',
        phone: '+94771234567',
        address: 'Colombo',
        membershipStatus: 'ACTIVE',
      })
      .expect(201);

    const createBody = createResponse.body as SuccessResponse<MemberSummary>;
    const memberId = createBody.data.id;

    expect(createBody.success).toBe(true);

    const listResponse = await request(app.getHttpServer() as Server)
      .get('/members')
      .set('x-user-role', 'LIBRARIAN')
      .query({ search: 'Nimal' })
      .expect(200);

    const listBody = listResponse.body as SuccessResponse<MemberListData>;
    expect(listBody.data.pagination.totalItems).toBe(1);
    expect(listBody.data.items[0].id).toBe(memberId);

    const updateResponse = await request(app.getHttpServer() as Server)
      .put(`/members/${memberId}`)
      .set('x-user-role', 'LIBRARIAN')
      .send({
        membershipStatus: 'BLOCKED',
      })
      .expect(200);

    const updateBody = updateResponse.body as SuccessResponse<MemberDetails>;
    expect(updateBody.data.membershipStatus).toBe('BLOCKED');

    const eligibilityResponse = await request(app.getHttpServer() as Server)
      .get(`/members/${memberId}/eligibility`)
      .expect(200);

    const eligibilityBody =
      eligibilityResponse.body as SuccessResponse<EligibilityData>;
    expect(eligibilityBody.data.eligibleToBorrow).toBe(false);
    expect(eligibilityBody.data.membershipStatus).toBe('BLOCKED');

    await request(app.getHttpServer() as Server)
      .delete(`/members/${memberId}`)
      .set('x-user-role', 'LIBRARIAN')
      .expect(403);

    const deleteResponse = await request(app.getHttpServer() as Server)
      .delete(`/members/${memberId}`)
      .set('x-user-role', 'ADMIN')
      .expect(200);

    const deleteBody = deleteResponse.body as SuccessResponse<MemberSummary>;
    expect(deleteBody.data.membershipStatus).toBe('INACTIVE');
  });

  it('exposes the health endpoint', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/members/health')
      .expect(200);

    const body = response.body as SuccessResponse<HealthData>;
    expect(body.success).toBe(true);
    expect(body.data.service).toBe('member-service');
  });
});
