import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MemberController } from './members/member.controller';
import { MEMBER_REPOSITORY } from './members/member.repository';
import { MemberService } from './members/member.service';
import { InMemoryMemberRepository } from './members/in-memory-member.repository';
import { PrismaMemberRepository } from './members/prisma-member.repository';
import { PrismaService } from './prisma/prisma.service';
import { RolesGuard } from './platform/roles/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
  ],
  controllers: [MemberController],
  providers: [
    MemberService,
    RolesGuard,
    PrismaService,
    InMemoryMemberRepository,
    PrismaMemberRepository,
    {
      provide: MEMBER_REPOSITORY,
      inject: [ConfigService, InMemoryMemberRepository, PrismaMemberRepository],
      useFactory: (
        configService: ConfigService,
        inMemoryMemberRepository: InMemoryMemberRepository,
        prismaMemberRepository: PrismaMemberRepository,
      ) => {
        const storageDriver =
          configService.get<string>('MEMBER_STORAGE_DRIVER') ??
          (configService.get<string>('NODE_ENV') === 'test'
            ? 'memory'
            : 'prisma');

        return storageDriver === 'memory'
          ? inMemoryMemberRepository
          : prismaMemberRepository;
      },
    },
  ],
})
export class MemberServiceModule {}
