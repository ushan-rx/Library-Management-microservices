import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { borrowServiceUnavailable } from '../common/borrow-response.helpers';

interface FineCreateResponse {
  success: boolean;
  data?: {
    id: string;
  };
}

@Injectable()
export class FineClient {
  private readonly logger = new Logger(FineClient.name);

  constructor(private readonly configService: ConfigService) {}

  async createOverdueFine(input: {
    memberId: string;
    borrowId: string;
    amount: number;
  }): Promise<string> {
    const baseUrl =
      this.configService.get<string>('FINE_PAYMENT_SERVICE_BASE_URL') ??
      'http://localhost:3006';

    const response = await fetch(`${baseUrl}/fines`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-role': 'LIBRARIAN',
      },
      body: JSON.stringify({
        memberId: input.memberId,
        borrowId: input.borrowId,
        amount: input.amount,
        reason: 'OVERDUE_RETURN',
        status: 'PENDING',
      }),
    }).catch((error: unknown) => {
      this.logger.error(`Fine creation request failed: ${String(error)}`);
      throw borrowServiceUnavailable(
        'Fine service is unavailable',
        'FINE_SERVICE_UNAVAILABLE',
      );
    });

    if (!response.ok) {
      throw borrowServiceUnavailable(
        'Fine service returned an unexpected response',
        'FINE_SERVICE_UNAVAILABLE',
      );
    }

    const body = (await response.json()) as FineCreateResponse;
    if (!body.success || !body.data?.id) {
      throw borrowServiceUnavailable(
        'Fine service returned an invalid response',
        'FINE_SERVICE_UNAVAILABLE',
      );
    }

    return body.data.id;
  }
}
