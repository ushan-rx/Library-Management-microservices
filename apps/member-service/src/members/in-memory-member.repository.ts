import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateMemberDto } from './dto/create-member.dto';
import { ListMembersQueryDto } from './dto/list-members.query.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberStatus } from './enums/member-status.enum';
import { Member } from './interfaces/member.interface';
import { MemberRepository, PaginatedMembers } from './member.repository';

@Injectable()
export class InMemoryMemberRepository implements MemberRepository {
  private readonly members = new Map<string, Member>();

  create(createMemberDto: CreateMemberDto): Promise<Member> {
    const now = new Date();
    const member: Member = {
      id: randomUUID(),
      fullName: createMemberDto.fullName,
      email: createMemberDto.email ?? null,
      phone: createMemberDto.phone ?? null,
      address: createMemberDto.address ?? null,
      membershipStatus: createMemberDto.membershipStatus,
      notes: createMemberDto.notes ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.members.set(member.id, member);

    return Promise.resolve(member);
  }

  list(query: ListMembersQueryDto): Promise<PaginatedMembers> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim().toLowerCase();

    const items = [...this.members.values()]
      .filter((member) => member.deletedAt === null)
      .filter((member) => {
        if (!query.membershipStatus) {
          return true;
        }

        return member.membershipStatus === query.membershipStatus;
      })
      .filter((member) => {
        if (!search) {
          return true;
        }

        return [member.fullName, member.email ?? '', member.phone ?? ''].some(
          (value) => value.toLowerCase().includes(search),
        );
      })
      .sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
      );

    const totalItems = items.length;
    const offset = (page - 1) * limit;

    return Promise.resolve({
      items: items.slice(offset, offset + limit),
      totalItems,
    });
  }

  findById(id: string): Promise<Member | null> {
    const member = this.members.get(id);

    if (!member || member.deletedAt !== null) {
      return Promise.resolve(null);
    }

    return Promise.resolve(member);
  }

  findByEmail(email: string): Promise<Member | null> {
    const normalizedEmail = email.toLowerCase();

    for (const member of this.members.values()) {
      if (member.deletedAt !== null || !member.email) {
        continue;
      }

      if (member.email.toLowerCase() === normalizedEmail) {
        return Promise.resolve(member);
      }
    }

    return Promise.resolve(null);
  }

  update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const existingMember = this.members.get(id);
    if (!existingMember) {
      throw new Error(`Member ${id} not found`);
    }

    const updatedMember: Member = {
      ...existingMember,
      ...updateMemberDto,
      email:
        updateMemberDto.email === undefined
          ? existingMember.email
          : (updateMemberDto.email ?? null),
      phone:
        updateMemberDto.phone === undefined
          ? existingMember.phone
          : (updateMemberDto.phone ?? null),
      address:
        updateMemberDto.address === undefined
          ? existingMember.address
          : (updateMemberDto.address ?? null),
      notes:
        updateMemberDto.notes === undefined
          ? existingMember.notes
          : (updateMemberDto.notes ?? null),
      updatedAt: new Date(),
    };

    this.members.set(id, updatedMember);

    return Promise.resolve(updatedMember);
  }

  softDelete(id: string): Promise<Member> {
    const existingMember = this.members.get(id);
    if (!existingMember) {
      throw new Error(`Member ${id} not found`);
    }

    const deletedMember: Member = {
      ...existingMember,
      membershipStatus: MemberStatus.INACTIVE,
      deletedAt: new Date(),
      updatedAt: new Date(),
    };

    this.members.set(id, deletedMember);

    return Promise.resolve(deletedMember);
  }
}
