import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Response } from 'express';
import { ServiceRegistryService } from '../config/service-registry.service';
import { RequestWithContext } from '../platform/request-context/request-context.types';

@Injectable()
export class GatewayProxyService {
  private readonly upstreamTimeoutMs = 5000;

  constructor(private readonly serviceRegistry: ServiceRegistryService) {}

  async forward(
    request: RequestWithContext,
    response: Response,
  ): Promise<void> {
    const target = this.serviceRegistry.resolveTarget(request.path);
    if (!target) {
      throw new NotFoundException('Route not found');
    }
    request.downstreamService = target.basePath;

    const abortController = new AbortController();
    const timeout = setTimeout(
      () => abortController.abort(),
      this.upstreamTimeoutMs,
    );

    try {
      const upstreamResponse = await fetch(
        `${target.baseUrl}${request.originalUrl ?? request.url}`,
        {
          method: request.method,
          headers: this.buildHeaders(request),
          body: this.buildBody(request),
          signal: abortController.signal,
        },
      ).catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new RequestTimeoutException('Downstream service timeout');
        }

        throw new ServiceUnavailableException('Downstream service unavailable');
      });

      const responseContentType =
        upstreamResponse.headers.get('content-type') ?? '';
      response.status(upstreamResponse.status);

      if (responseContentType.includes('application/json')) {
        response.json((await upstreamResponse.json()) as unknown);
        return;
      }

      response.send(await upstreamResponse.text());
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildHeaders(request: RequestWithContext): Headers {
    const headers = new Headers();

    const acceptHeader = request.header('accept');
    const authorizationHeader = request.header('authorization');
    const contentTypeHeader = request.header('content-type');

    if (acceptHeader) {
      headers.set('accept', acceptHeader);
    }

    if (contentTypeHeader) {
      headers.set('content-type', contentTypeHeader);
    }

    if (authorizationHeader) {
      headers.set('authorization', authorizationHeader);
    }

    if (request.correlationId) {
      headers.set('x-correlation-id', request.correlationId);
    }

    if (request.authenticatedUser) {
      headers.set('x-user-id', request.authenticatedUser.id);
      headers.set('x-user-role', request.authenticatedUser.role);

      if (request.authenticatedUser.username) {
        headers.set('x-username', request.authenticatedUser.username);
      }
    }

    return headers;
  }

  private buildBody(request: RequestWithContext): string | undefined {
    if (request.method === 'GET' || request.method === 'HEAD') {
      return undefined;
    }

    if (request.body === undefined || request.body === null) {
      return undefined;
    }

    if (typeof request.body === 'string') {
      return request.body;
    }

    return JSON.stringify(request.body);
  }
}
