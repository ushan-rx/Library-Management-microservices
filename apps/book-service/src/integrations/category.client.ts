import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  bookBadRequest,
  bookServiceUnavailable,
} from '../common/book-response.helpers';

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

    const response = await fetch(
      `${categoryServiceBaseUrl}/categories/${categoryId}/existence`,
    ).catch((error: unknown) => {
      this.logger.error(`Category validation request failed: ${String(error)}`);
      throw bookServiceUnavailable(
        'Category service is unavailable',
        'CATEGORY_SERVICE_UNAVAILABLE',
      );
    });

    if (!response.ok) {
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
  }
}
