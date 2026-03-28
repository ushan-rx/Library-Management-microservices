import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  bookBadRequest,
  bookServiceUnavailable,
} from '../common/book-response.helpers';
import {
  createDownstreamHeaders,
  createDownstreamRequestContext,
} from './downstream-request.util';

interface CategoryExistenceResponse {
  success: boolean;
  data?: {
    exists: boolean;
    active: boolean;
  };
}

@Injectable()
export class CategoryClient {
  private readonly logger = new Logger(CategoryClient.name);

  constructor(private readonly configService: ConfigService) {}

  async validateCategory(categoryId: string): Promise<void> {
    const validationEnabled =
      (this.configService.get<string>('BOOK_VALIDATE_CATEGORY_ON_WRITE') ??
        'true') === 'true';

    if (!validationEnabled) {
      return;
    }

    const categoryServiceBaseUrl =
      this.configService.get<string>('CATEGORY_SERVICE_BASE_URL') ??
      'http://localhost:3004';
    const requestContext = createDownstreamRequestContext();

    this.logger.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'log',
        service: process.env.BOOK_SERVICE_NAME ?? 'book-service',
        operation: 'validate-category',
        downstreamService: 'category-service',
        categoryId,
        correlationId: requestContext.correlationId,
      }),
    );

    const response = await fetch(
      `${categoryServiceBaseUrl}/categories/${categoryId}/existence`,
      {
        headers: createDownstreamHeaders(requestContext.correlationId),
      },
    ).catch((error: unknown) => {
      this.logger.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          service: process.env.BOOK_SERVICE_NAME ?? 'book-service',
          operation: 'validate-category',
          downstreamService: 'category-service',
          categoryId,
          correlationId: requestContext.correlationId,
          durationMs: Date.now() - requestContext.startedAt,
          error: String(error),
        }),
      );
      throw bookServiceUnavailable(
        'Category service is unavailable',
        'CATEGORY_SERVICE_UNAVAILABLE',
      );
    });

    if (!response.ok) {
      this.logger.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          service: process.env.BOOK_SERVICE_NAME ?? 'book-service',
          operation: 'validate-category',
          downstreamService: 'category-service',
          categoryId,
          correlationId: requestContext.correlationId,
          durationMs: Date.now() - requestContext.startedAt,
          statusCode: response.status,
        }),
      );
      throw bookServiceUnavailable(
        'Category service returned an unexpected response',
        'CATEGORY_SERVICE_UNAVAILABLE',
      );
    }

    const body = (await response.json()) as CategoryExistenceResponse;
    if (!body.success || !body.data?.exists || !body.data.active) {
      throw bookBadRequest(
        'Category is invalid or inactive',
        'INVALID_CATEGORY',
      );
    }

    this.logger.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'log',
        service: process.env.BOOK_SERVICE_NAME ?? 'book-service',
        operation: 'validate-category',
        downstreamService: 'category-service',
        categoryId,
        correlationId: requestContext.correlationId,
        durationMs: Date.now() - requestContext.startedAt,
        statusCode: response.status,
      }),
    );
  }
}
