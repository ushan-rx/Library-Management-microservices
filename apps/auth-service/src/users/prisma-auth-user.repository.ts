import { Injectable } from '@nestjs/common';
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
    return this.prismaService.authUser.create({
      data: input,
    });
  }

  async findById(id: string): Promise<AuthUser | null> {
    return this.prismaService.authUser.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByUsername(username: string): Promise<AuthUser | null> {
    return this.prismaService.authUser.findFirst({
      where: { username, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.prismaService.authUser.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findByLogin(login: string): Promise<AuthUser | null> {
    return this.prismaService.authUser.findFirst({
      where: {
        OR: [{ username: login }, { email: login }],
        deletedAt: null,
      },
    });
  }

  async update(id: string, input: UpdateAuthUserInput): Promise<AuthUser> {
    return this.prismaService.authUser.update({
      where: { id },
      data: input,
    });
  }
}
