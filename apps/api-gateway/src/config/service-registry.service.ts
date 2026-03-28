import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DownstreamServiceTarget {
  basePath: string;
  baseUrl: string;
  protectedByDefault: boolean;
}

type ServiceKey =
  | 'auth'
  | 'member'
  | 'book'
  | 'category'
  | 'borrow'
  | 'finePayment';

@Injectable()
export class ServiceRegistryService {
  constructor(private readonly configService: ConfigService) {}

  getTargets(): Record<ServiceKey, DownstreamServiceTarget> {
    return {
      auth: {
        basePath: '/auth',
        baseUrl: this.getRequired(
          'AUTH_SERVICE_BASE_URL',
          'http://localhost:3001',
        ),
        protectedByDefault: false,
      },
      member: {
        basePath: '/members',
        baseUrl: this.getRequired(
          'MEMBER_SERVICE_BASE_URL',
          'http://localhost:3002',
        ),
        protectedByDefault: true,
      },
      book: {
        basePath: '/books',
        baseUrl: this.getRequired(
          'BOOK_SERVICE_BASE_URL',
          'http://localhost:3003',
        ),
        protectedByDefault: true,
      },
      category: {
        basePath: '/categories',
        baseUrl: this.getRequired(
          'CATEGORY_SERVICE_BASE_URL',
          'http://localhost:3004',
        ),
        protectedByDefault: true,
      },
      borrow: {
        basePath: '/borrows',
        baseUrl: this.getRequired(
          'BORROW_SERVICE_BASE_URL',
          'http://localhost:3005',
        ),
        protectedByDefault: true,
      },
      finePayment: {
        basePath: '/fines',
        baseUrl: this.getRequired(
          'FINE_PAYMENT_SERVICE_BASE_URL',
          'http://localhost:3006',
        ),
        protectedByDefault: true,
      },
    };
  }

  getPublicRoutePrefixes(): string[] {
    return ['/health', '/auth/register', '/auth/login'];
  }

  getProtectedRoutePrefixes(): string[] {
    return [
      '/auth/profile',
      '/members',
      '/categories',
      '/books',
      '/borrows',
      '/fines',
    ];
  }

  resolveTarget(path: string): DownstreamServiceTarget | null {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return (
      Object.values(this.getTargets()).find(
        (target) =>
          normalizedPath === target.basePath ||
          normalizedPath.startsWith(`${target.basePath}/`),
      ) ?? null
    );
  }

  private getRequired(key: string, fallback: string): string {
    return this.configService.get<string>(key) ?? fallback;
  }
}
