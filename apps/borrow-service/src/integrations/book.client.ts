import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  borrowConflict,
  bookNotFound,
  borrowServiceUnavailable,
} from '../common/borrow-response.helpers';

interface BookAvailabilityResponse {
  success: boolean;
  data?: {
    exists: boolean;
    available: boolean;
  };
}

interface InventoryMutationResponse {
  success: boolean;
}

@Injectable()
export class BookClient {
  private readonly logger = new Logger(BookClient.name);

  constructor(private readonly configService: ConfigService) {}

  async validateAvailability(bookId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl()}/books/${bookId}/availability`,
    ).catch((error: unknown) => {
      this.logger.error(`Book validation request failed: ${String(error)}`);
      throw borrowServiceUnavailable(
        'Book service is unavailable',
        'BOOK_SERVICE_UNAVAILABLE',
      );
    });

    if (!response.ok) {
      throw borrowServiceUnavailable(
        'Book service returned an unexpected response',
        'BOOK_SERVICE_UNAVAILABLE',
      );
    }

    const body = (await response.json()) as BookAvailabilityResponse;
    if (!body.success || !body.data?.exists) {
      throw bookNotFound('Book not found');
    }

    if (!body.data.available) {
      throw borrowConflict('Book is not available', 'BOOK_NOT_AVAILABLE');
    }
  }

  async decrementInventory(bookId: string, referenceId: string): Promise<void> {
    await this.postInventoryAdjustment(bookId, 'BORROW_CREATED', referenceId);
  }

  async incrementInventory(bookId: string, referenceId: string): Promise<void> {
    await this.postInventoryAdjustment(bookId, 'BOOK_RETURNED', referenceId);
  }

  private async postInventoryAdjustment(
    bookId: string,
    reason: string,
    referenceId: string,
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl()}/books/${bookId}/inventory/${reason === 'BORROW_CREATED' ? 'decrement' : 'increment'}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user-role': 'LIBRARIAN',
        },
        body: JSON.stringify({
          reason,
          quantity: 1,
          referenceId,
        }),
      },
    ).catch((error: unknown) => {
      this.logger.error(`Book inventory request failed: ${String(error)}`);
      throw borrowServiceUnavailable(
        'Book service is unavailable',
        'BOOK_SERVICE_UNAVAILABLE',
      );
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw bookNotFound('Book not found');
      }

      if (response.status === 409) {
        throw borrowConflict('Book is not available', 'BOOK_NOT_AVAILABLE');
      }

      throw borrowServiceUnavailable(
        'Book service returned an unexpected response',
        'BOOK_SERVICE_UNAVAILABLE',
      );
    }

    const body = (await response.json()) as InventoryMutationResponse;
    if (!body.success) {
      throw borrowServiceUnavailable(
        'Book service returned an invalid response',
        'BOOK_SERVICE_UNAVAILABLE',
      );
    }
  }

  private baseUrl() {
    return (
      this.configService.get<string>('BOOK_SERVICE_BASE_URL') ??
      'http://localhost:3003'
    );
  }
}
