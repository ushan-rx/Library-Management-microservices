import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ServiceRegistryService } from '../config/service-registry.service';
import { RequestWithContext } from '../platform/request-context/request-context.types';

@Injectable()
export class GatewayProxyService {
  constructor(private readonly serviceRegistry: ServiceRegistryService) {}

  async forward(
    request: RequestWithContext,
    response: Response,
  ): Promise<void> {
    const target = this.serviceRegistry.resolveTarget(request.path);
    if (!target) {
      throw new HttpException(
        {
          success: false,
          message: 'Route not found',
          error: {
            code: 'ROUTE_NOT_FOUND',
            details: [],
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const upstreamUrl = new URL(
      `${target.baseUrl}${request.originalUrl ?? request.url}`,
    );
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 5000);

    try {
      const upstreamResponse = await fetch(upstreamUrl, {
        method: request.method,
        headers: this.buildForwardHeaders(request),
        body: this.getForwardBody(request),
        signal: abortController.signal,
      });

      clearTimeout(timeout);

      const responseText = await upstreamResponse.text();
      const responseContentType =
        upstreamResponse.headers.get('content-type') ?? 'application/json';

      response.status(upstreamResponse.status);
      response.setHeader('x-correlation-id', request.correlationId ?? '');
      response.setHeader('content-type', responseContentType);

      if (!responseText) {
        response.send();
        return;
      }

      if (responseContentType.includes('application/json')) {
        const parsed = JSON.parse(responseText) as unknown;
        response.json(parsed);
        return;
      }

      response.send(responseText);
    } catch (error: unknown) {
      clearTimeout(timeout);

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new HttpException(
          {
            success: false,
            message: 'Downstream service timeout',
            error: {
              code: 'UPSTREAM_TIMEOUT',
              details: [],
            },
          },
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: 'Downstream service unavailable',
          error: {
            code: 'UPSTREAM_UNAVAILABLE',
            details: [],
          },
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private buildForwardHeaders(request: RequestWithContext): HeadersInit {
    const headers = new Headers();

    for (const [key, value] of Object.entries(request.headers)) {
      if (value === undefined) {
        continue;
      }

      if (
        [
          'host',
          'content-length',
          'x-user-id',
          'x-user-role',
          'x-username',
        ].includes(key)
      ) {
        continue;
      }

      if (Array.isArray(value)) {
        headers.set(key, value.join(','));
        continue;
      }

      headers.set(key, value);
    }

    headers.set('x-correlation-id', request.correlationId ?? '');

    if (request.authenticatedUser) {
      headers.set('x-user-id', request.authenticatedUser.id);
      headers.set('x-user-role', request.authenticatedUser.role);
      if (request.authenticatedUser.username) {
        headers.set('x-username', request.authenticatedUser.username);
      }
    }

    return headers;
  }

  private getForwardBody(request: RequestWithContext): BodyInit | undefined {
    if (request.method === 'GET' || request.method === 'HEAD') {
      return undefined;
    }

    const requestBody = request.body as Record<string, unknown> | undefined;
    if (!requestBody || Object.keys(requestBody).length === 0) {
      return undefined;
    }

    return JSON.stringify(requestBody);
  }
}
