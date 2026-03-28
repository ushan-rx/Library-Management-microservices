import { randomUUID } from 'node:crypto';

export interface DownstreamRequestContext {
  correlationId: string;
  startedAt: number;
}

export function createDownstreamRequestContext(): DownstreamRequestContext {
  return {
    correlationId: randomUUID(),
    startedAt: Date.now(),
  };
}

export function createDownstreamHeaders(
  correlationId: string,
  extraHeaders: Record<string, string> = {},
): Record<string, string> {
  return {
    'x-correlation-id': correlationId,
    ...extraHeaders,
  };
}
