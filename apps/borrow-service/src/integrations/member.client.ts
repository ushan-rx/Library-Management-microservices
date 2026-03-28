import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  borrowForbidden,
  memberNotFound,
  borrowServiceUnavailable,
} from '../common/borrow-response.helpers';

interface MemberEligibilityResponse {
  success: boolean;
  data?: {
    exists: boolean;
    eligibleToBorrow: boolean;
    membershipStatus: string | null;
  };
}

@Injectable()
export class MemberClient {
  private readonly logger = new Logger(MemberClient.name);

  constructor(private readonly configService: ConfigService) {}

  async validateBorrowEligibility(memberId: string): Promise<void> {
    const baseUrl =
      this.configService.get<string>('MEMBER_SERVICE_BASE_URL') ??
      'http://localhost:3002';

    const response = await fetch(
      `${baseUrl}/members/${memberId}/eligibility`,
    ).catch((error: unknown) => {
      this.logger.error(`Member validation request failed: ${String(error)}`);
      throw borrowServiceUnavailable(
        'Member service is unavailable',
        'MEMBER_SERVICE_UNAVAILABLE',
      );
    });

    if (!response.ok) {
      throw borrowServiceUnavailable(
        'Member service returned an unexpected response',
        'MEMBER_SERVICE_UNAVAILABLE',
      );
    }

    const body = (await response.json()) as MemberEligibilityResponse;
    if (!body.success || !body.data?.exists) {
      throw memberNotFound('Member not found');
    }

    if (!body.data.eligibleToBorrow) {
      throw borrowForbidden(
        'Member is not eligible to borrow',
        'MEMBER_NOT_ELIGIBLE',
      );
    }
  }
}
