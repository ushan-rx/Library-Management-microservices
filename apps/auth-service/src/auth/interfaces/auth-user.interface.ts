import { AuthRole } from '../enums/auth-role.enum';
import { AuthUserStatus } from '../enums/auth-user-status.enum';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: AuthRole;
  status: AuthUserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
