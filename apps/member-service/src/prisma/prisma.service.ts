import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolveConfigValue } from '../../../shared/config/runtime-config.util';
import { PrismaClient } from '../../prisma/generated/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: resolveConfigValue(configService, 'MEMBER_DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    if (this.configService.get<string>('MEMBER_STORAGE_DRIVER') === 'memory') {
      return;
    }

    await this.$connect();
    this.logger.log('Member service database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.configService.get<string>('MEMBER_STORAGE_DRIVER') === 'memory') {
      return;
    }

    await this.$disconnect();
  }
}
