import { Injectable } from '@nestjs/common';
import {
  AuthRole as PrismaAuthRole,
  AuthUserStatus as PrismaAuthUserStatus,
} from '../../prisma/generated/client';
import { AuthRole } from '../auth/enums/auth-role.enum';
import { AuthUserStatus } from '../auth/enums/auth-user-status.enum';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuthUserRepository,
  CreateAuthUserInput,
  UpdateAuthUserInput,
} from './auth-user.repository';

@Injectable()
export class PrismaAuthUserRepository implements AuthUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(input: CreateAuthUserInput): Promise<AuthUser> {
    const createdUser = await this.prismaService.authUser.create({
      data: {
        ...input,
        role: this.toPrismaRole(input.role),
        status: this.toPrismaStatus(input.status),
      },
    });

    return this.toDomainAuthUser(createdUser);
  }

  async findById(id: string): Promise<AuthUser | null> {
    const authUser = await this.prismaService.authUser.findFirst({
      where: { id, deletedAt: null },
    });

    return authUser ? this.toDomainAuthUser(authUser) : null;
  }

  async findByUsername(username: string): Promise<AuthUser | null> {
    const authUser = await this.prismaService.authUser.findFirst({
      where: { username, deletedAt: null },
    });

    return authUser ? this.toDomainAuthUser(authUser) : null;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const authUser = await this.prismaService.authUser.findFirst({
      where: { email, deletedAt: null },
    });

    return authUser ? this.toDomainAuthUser(authUser) : null;
  }

  async findByLogin(login: string): Promise<AuthUser | null> {
    const authUser = await this.prismaService.authUser.findFirst({
      where: {
        OR: [{ username: login }, { email: login }],
        deletedAt: null,
      },
    });

    return authUser ? this.toDomainAuthUser(authUser) : null;
  }

  async update(id: string, input: UpdateAuthUserInput): Promise<AuthUser> {
    const updatedUser = await this.prismaService.authUser.update({
      where: { id },
      data: {
        ...input,
        ...(input.status ? { status: this.toPrismaStatus(input.status) } : {}),
      },
    });

    return this.toDomainAuthUser(updatedUser);
  }

  private toDomainAuthUser(authUser: {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    role: PrismaAuthRole;
    status: PrismaAuthUserStatus;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): AuthUser {
    return {
      ...authUser,
      role: this.toDomainRole(authUser.role),
      status: this.toDomainStatus(authUser.status),
    };
  }

  private toDomainRole(role: PrismaAuthRole): AuthRole {
    switch (role) {
      case PrismaAuthRole.ADMIN:
        return AuthRole.ADMIN;
      case PrismaAuthRole.LIBRARIAN:
        return AuthRole.LIBRARIAN;
      case PrismaAuthRole.MEMBER:
        return AuthRole.MEMBER;
    }
  }

  private toPrismaRole(role: AuthRole): PrismaAuthRole {
    switch (role) {
      case AuthRole.ADMIN:
        return PrismaAuthRole.ADMIN;
      case AuthRole.LIBRARIAN:
        return PrismaAuthRole.LIBRARIAN;
      case AuthRole.MEMBER:
        return PrismaAuthRole.MEMBER;
    }
  }

  private toDomainStatus(status: PrismaAuthUserStatus): AuthUserStatus {
    switch (status) {
      case PrismaAuthUserStatus.ACTIVE:
        return AuthUserStatus.ACTIVE;
      case PrismaAuthUserStatus.INACTIVE:
        return AuthUserStatus.INACTIVE;
      case PrismaAuthUserStatus.LOCKED:
        return AuthUserStatus.LOCKED;
    }
  }

  private toPrismaStatus(status: AuthUserStatus): PrismaAuthUserStatus {
    switch (status) {
      case AuthUserStatus.ACTIVE:
        return PrismaAuthUserStatus.ACTIVE;
      case AuthUserStatus.INACTIVE:
        return PrismaAuthUserStatus.INACTIVE;
      case AuthUserStatus.LOCKED:
        return PrismaAuthUserStatus.LOCKED;
    }
  }
}
