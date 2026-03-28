import { Test, TestingModule } from '@nestjs/testing';
import { MEMBER_REPOSITORY } from './member.repository';
import { InMemoryMemberRepository } from './in-memory-member.repository';
import { MemberService } from './member.service';
import { MemberStatus } from './enums/member-status.enum';

describe('MemberService', () => {
  let service: MemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        InMemoryMemberRepository,
        {
          provide: MEMBER_REPOSITORY,
          useExisting: InMemoryMemberRepository,
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
  });

  it('creates a member', async () => {
    const response = await service.create({
      fullName: 'Nimal Perera',
      email: 'nimal@example.com',
      membershipStatus: MemberStatus.ACTIVE,
    });

    expect(response.success).toBe(true);
    expect(response.data.fullName).toBe('Nimal Perera');
    expect(response.data.membershipStatus).toBe(MemberStatus.ACTIVE);
  });

  it('marks blocked members as ineligible', async () => {
    const created = await service.create({
      fullName: 'Blocked Member',
      email: 'blocked@example.com',
      membershipStatus: MemberStatus.BLOCKED,
    });

    const response = await service.eligibility(created.data.id);

    expect(response.success).toBe(true);
    expect(response.data.exists).toBe(true);
    expect(response.data.eligibleToBorrow).toBe(false);
    expect(response.data.membershipStatus).toBe(MemberStatus.BLOCKED);
  });

  it('soft deletes members by deactivating them', async () => {
    const created = await service.create({
      fullName: 'Delete Me',
      email: 'delete@example.com',
      membershipStatus: MemberStatus.ACTIVE,
    });

    const deleted = await service.remove(created.data.id);
    const listed = await service.list({});

    expect(deleted.success).toBe(true);
    expect(deleted.data.membershipStatus).toBe(MemberStatus.INACTIVE);
    expect(listed.data.items).toHaveLength(0);
  });
});
