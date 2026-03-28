import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  memberConflict,
  memberNotFound,
} from '../common/member-response.helpers';
import { CreateMemberDto } from './dto/create-member.dto';
import { ListMembersQueryDto } from './dto/list-members.query.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberStatus } from './enums/member-status.enum';
import { Member } from './interfaces/member.interface';
import { MEMBER_REPOSITORY, MemberRepository } from './member.repository';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    await this.assertEmailAvailable(createMemberDto.email);

    const member = await this.memberRepository.create(createMemberDto);
    this.logger.log(`Library member created: ${member.id}`);

    return {
      success: true,
      message: 'Member created successfully',
      data: {
        id: member.id,
        fullName: member.fullName,
        membershipStatus: member.membershipStatus,
      },
    };
  }

  async list(query: ListMembersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { items, totalItems } = await this.memberRepository.list(query);

    return {
      success: true,
      message: 'Members retrieved successfully',
      data: {
        items: items.map((member) => this.toMemberResponse(member)),
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit),
        },
      },
    };
  }

  async getById(memberId: string) {
    const member = await this.requireMember(memberId);

    return {
      success: true,
      message: 'Member retrieved successfully',
      data: this.toMemberResponse(member),
    };
  }

  async update(memberId: string, updateMemberDto: UpdateMemberDto) {
    const existingMember = await this.requireMember(memberId);

    if (
      updateMemberDto.email &&
      updateMemberDto.email !== existingMember.email
    ) {
      await this.assertEmailAvailable(updateMemberDto.email, memberId);
    }

    const member = await this.memberRepository.update(
      memberId,
      updateMemberDto,
    );
    this.logger.log(`Library member updated: ${member.id}`);

    return {
      success: true,
      message: 'Member updated successfully',
      data: this.toMemberResponse(member),
    };
  }

  async remove(memberId: string) {
    await this.requireMember(memberId);
    const member = await this.memberRepository.softDelete(memberId);
    this.logger.log(`Library member deactivated: ${member.id}`);

    return {
      success: true,
      message: 'Member deactivated successfully',
      data: {
        id: member.id,
        membershipStatus: member.membershipStatus,
        deletedAt: member.deletedAt,
      },
    };
  }

  async eligibility(memberId: string) {
    const member = await this.memberRepository.findById(memberId);

    if (!member) {
      return {
        success: true,
        message: 'Member eligibility checked successfully',
        data: {
          memberId,
          exists: false,
          eligibleToBorrow: false,
          membershipStatus: null,
        },
      };
    }

    return {
      success: true,
      message: 'Member eligibility checked successfully',
      data: {
        memberId: member.id,
        exists: true,
        eligibleToBorrow: member.membershipStatus === MemberStatus.ACTIVE,
        membershipStatus: member.membershipStatus,
      },
    };
  }

  health() {
    return {
      success: true,
      message: 'Member service healthy',
      data: {
        service: process.env.MEMBER_SERVICE_NAME ?? 'member-service',
        status: 'UP',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private async requireMember(memberId: string): Promise<Member> {
    const member = await this.memberRepository.findById(memberId);
    if (!member) {
      throw memberNotFound();
    }

    return member;
  }

  private async assertEmailAvailable(email?: string, currentMemberId?: string) {
    if (!email) {
      return;
    }

    const existingMember = await this.memberRepository.findByEmail(email);
    if (existingMember && existingMember.id !== currentMemberId) {
      throw memberConflict('Email already exists', 'EMAIL_ALREADY_EXISTS');
    }
  }

  private toMemberResponse(member: Member) {
    return {
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      address: member.address,
      membershipStatus: member.membershipStatus,
      notes: member.notes,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }
}
