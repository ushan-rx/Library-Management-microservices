import { FineStatus } from '../enums/fine-status.enum';

export interface Fine {
  id: string;
  memberId: string;
  borrowId: string;
  amount: number;
  reason: string;
  status: FineStatus;
  issuedDate: Date;
  paidDate: Date | null;
  waivedDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
