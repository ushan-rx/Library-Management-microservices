import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import {
  AuthUserRepository,
  CreateAuthUserInput,
  UpdateAuthUserInput,
} from './auth-user.repository';

@Injectable()
export class InMemoryAuthUserRepository implements AuthUserRepository {
  private readonly users = new Map<string, AuthUser>();

  create(input: CreateAuthUserInput): Promise<AuthUser> {
    const now = new Date();
    const user: AuthUser = {
      id: randomUUID(),
      username: input.username,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
      status: input.status,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  findById(id: string): Promise<AuthUser | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  findByUsername(username: string): Promise<AuthUser | null> {
    return Promise.resolve(
      [...this.users.values()].find((user) => user.username === username) ??
        null,
    );
  }

  findByEmail(email: string): Promise<AuthUser | null> {
    return Promise.resolve(
      [...this.users.values()].find((user) => user.email === email) ?? null,
    );
  }

  findByLogin(login: string): Promise<AuthUser | null> {
    return Promise.resolve(
      [...this.users.values()].find(
        (user) => user.username === login || user.email === login,
      ) ?? null,
    );
  }

  update(id: string, input: UpdateAuthUserInput): Promise<AuthUser> {
    const existingUser = this.users.get(id);

    if (!existingUser) {
      throw new Error(`Auth user ${id} not found`);
    }

    const updatedUser: AuthUser = {
      ...existingUser,
      ...input,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return Promise.resolve(updatedUser);
  }
}
