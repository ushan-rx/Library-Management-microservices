import { AuthRole } from '../auth/enums/auth-role.enum';
import { AuthUserStatus } from '../auth/enums/auth-user-status.enum';
import { AuthUser } from '../auth/interfaces/auth-user.interface';

export const AUTH_USER_REPOSITORY = Symbol('AUTH_USER_REPOSITORY');

export interface CreateAuthUserInput {
  username: string;
  email: string;
  passwordHash: string;
  role: AuthRole;
  status: AuthUserStatus;
}

export interface UpdateAuthUserInput {
  lastLoginAt?: Date | null;
  status?: AuthUserStatus;
}

export interface AuthUserRepository {
  create(input: CreateAuthUserInput): Promise<AuthUser>;
  findById(id: string): Promise<AuthUser | null>;
  findByUsername(username: string): Promise<AuthUser | null>;
  findByEmail(email: string): Promise<AuthUser | null>;
  findByLogin(login: string): Promise<AuthUser | null>;
  update(id: string, input: UpdateAuthUserInput): Promise<AuthUser>;
}
