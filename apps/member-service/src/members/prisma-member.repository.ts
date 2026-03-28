import { Injectable } from '@nestjs/common';
import {
  Prisma,
  MemberStatus as PrismaMemberStatus,
} from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { ListMembersQueryDto } from './dto/list-members.query.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberStatus } from './enums/member-status.enum';
import { Member } from './interfaces/member.interface';
import { MemberRepository, PaginatedMembers } from './member.repository';

@Injectable()
export class PrismaMemberRepository implements MemberRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const member = await this.prismaService.member.create({
      data: {
        fullName: createMemberDto.fullName,
        email: createMemberDto.email ?? null,
        phone: createMemberDto.phone ?? null,
        address: createMemberDto.address ?? null,
        membershipStatus: this.toPrismaStatus(createMemberDto.membershipStatus),
        notes: createMemberDto.notes ?? null,
      },
    });

    return this.toDomainMember(member);
  }

  async list(query: ListMembersQueryDto): Promise<PaginatedMembers> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.MemberWhereInput = {
      deletedAt: null,
      ...(query.membershipStatus
        ? {
            membershipStatus: this.toPrismaStatus(query.membershipStatus),
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                fullName: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                phone: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, totalItems] = await this.prismaService.$transaction([
      this.prismaService.member.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.member.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toDomainMember(item)),
      totalItems,
    };
  }

  async findById(id: string): Promise<Member | null> {
    const member = await this.prismaService.member.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    return member ? this.toDomainMember(member) : null;
  }

  async findByEmail(email: string): Promise<Member | null> {
    const member = await this.prismaService.member.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    return member ? this.toDomainMember(member) : null;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const member = await this.prismaService.member.update({
      where: { id },
      data: {
        ...(updateMemberDto.fullName !== undefined
          ? { fullName: updateMemberDto.fullName }
          : {}),
        ...(updateMemberDto.email !== undefined
          ? { email: updateMemberDto.email ?? null }
          : {}),
        ...(updateMemberDto.phone !== undefined
          ? { phone: updateMemberDto.phone ?? null }
          : {}),
        ...(updateMemberDto.address !== undefined
          ? { address: updateMemberDto.address ?? null }
          : {}),
        ...(updateMemberDto.membershipStatus !== undefined
          ? {
              membershipStatus: this.toPrismaStatus(
                updateMemberDto.membershipStatus,
              ),
            }
          : {}),
        ...(updateMemberDto.notes !== undefined
          ? { notes: updateMemberDto.notes ?? null }
          : {}),
      },
    });

    return this.toDomainMember(member);
  }

  async softDelete(id: string): Promise<Member> {
    const member = await this.prismaService.member.update({
      where: { id },
      data: {
        membershipStatus: PrismaMemberStatus.INACTIVE,
        deletedAt: new Date(),
      },
    });

    return this.toDomainMember(member);
  }

  private toDomainMember(member: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    membershipStatus: PrismaMemberStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Member {
    return {
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      address: member.address,
      membershipStatus: this.toDomainStatus(member.membershipStatus),
      notes: member.notes,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      deletedAt: member.deletedAt,
    };
  }

  private toPrismaStatus(status: MemberStatus): PrismaMemberStatus {
    return status as PrismaMemberStatus;
  }

  private toDomainStatus(status: PrismaMemberStatus): MemberStatus {
    return status as MemberStatus;
  }
}
