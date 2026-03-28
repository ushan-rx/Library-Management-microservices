import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
          url: configService.get<string>('FINE_DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    if (this.configService.get<string>('FINE_STORAGE_DRIVER') === 'memory') {
      return;
    }

    await this.$connect();
    this.logger.log('Fine payment service database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.configService.get<string>('FINE_STORAGE_DRIVER') === 'memory') {
      return;
    }

    await this.$disconnect();
  }
}
