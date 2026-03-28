import { Request } from 'express';

export interface RequestWithContext extends Request {
  body?: unknown;
  correlationId?: string;
  requestStartedAt?: number;
  authenticatedUser?: {
    id: string;
    role: string;
    username?: string;
  };
}
