import { Request } from 'express';

export interface RequestWithContext extends Request {
  correlationId?: string;
  requestStartedAt?: number;
  authenticatedUser?: {
    id: string;
    role: string;
    username?: string;
    email?: string;
  };
  forwardHeaders?: Record<string, string>;
}
