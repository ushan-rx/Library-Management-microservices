import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  borrowForbidden,
  memberNotFound,
  borrowServiceUnavailable,
} from '../common/borrow-response.helpers';
import {
  createDownstreamHeaders,
  createDownstreamRequestContext,
} from './downstream-request.util';

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
    const requestContext = createDownstreamRequestContext();

    this.logger.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'log',
        service: process.env.BORROW_SERVICE_NAME ?? 'borrow-service',
        operation: 'validate-member-eligibility',
        downstreamService: 'member-service',
        memberId,
        correlationId: requestContext.correlationId,
      }),
    );

    const response = await fetch(`${baseUrl}/members/${memberId}/eligibility`, {
      headers: createDownstreamHeaders(requestContext.correlationId),
    }).catch((error: unknown) => {
      this.logger.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          service: process.env.BORROW_SERVICE_NAME ?? 'borrow-service',
          operation: 'validate-member-eligibility',
          downstreamService: 'member-service',
          memberId,
          correlationId: requestContext.correlationId,
          durationMs: Date.now() - requestContext.startedAt,
          error: String(error),
        }),
      );
      throw borrowServiceUnavailable(
        'Member service is unavailable',
        'MEMBER_SERVICE_UNAVAILABLE',
      );
    });

    if (!response.ok) {
      this.logger.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          service: process.env.BORROW_SERVICE_NAME ?? 'borrow-service',
          operation: 'validate-member-eligibility',
          downstreamService: 'member-service',
          memberId,
          correlationId: requestContext.correlationId,
          durationMs: Date.now() - requestContext.startedAt,
          statusCode: response.status,
        }),
      );
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

    this.logger.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'log',
        service: process.env.BORROW_SERVICE_NAME ?? 'borrow-service',
        operation: 'validate-member-eligibility',
        downstreamService: 'member-service',
        memberId,
        correlationId: requestContext.correlationId,
        durationMs: Date.now() - requestContext.startedAt,
        statusCode: response.status,
      }),
    );
  }
}
