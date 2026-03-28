import { CreateMemberDto } from './dto/create-member.dto';
import { ListMembersQueryDto } from './dto/list-members.query.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './interfaces/member.interface';

export const MEMBER_REPOSITORY = Symbol('MEMBER_REPOSITORY');

export interface PaginatedMembers {
  items: Member[];
  totalItems: number;
}

export interface MemberRepository {
  create(createMemberDto: CreateMemberDto): Promise<Member>;
  list(query: ListMembersQueryDto): Promise<PaginatedMembers>;
  findById(id: string): Promise<Member | null>;
  findByEmail(email: string): Promise<Member | null>;
  update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member>;
  softDelete(id: string): Promise<Member>;
}
