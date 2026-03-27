import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { RequestWithContext } from './request-context.types';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(
    request: RequestWithContext,
    response: Response,
    next: NextFunction,
  ): void {
    const incomingCorrelationId = request.header('x-correlation-id');
    const correlationId =
      incomingCorrelationId && incomingCorrelationId.trim().length > 0
        ? incomingCorrelationId
        : randomUUID();

    request.correlationId = correlationId;
    request.requestStartedAt = Date.now();
    response.setHeader('x-correlation-id', correlationId);

    next();
  }
}
