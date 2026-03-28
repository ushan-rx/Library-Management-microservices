import { MemberStatus } from '../enums/member-status.enum';

export interface Member {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  membershipStatus: MemberStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
