import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithContext } from '../request-context/request-context.types';

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<RequestWithContext>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody =
      exception instanceof HttpException ? exception.getResponse() : null;
    const message = this.getMessage(statusCode, responseBody);

    response.status(statusCode).json({
      success: false,
      message,
      error: {
        code: this.getErrorCode(statusCode),
        details: [],
      },
      correlationId: request.correlationId,
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
    });
  }

  private getMessage(statusCode: number, responseBody: unknown): string {
    if (typeof responseBody === 'string') {
      return responseBody;
    }

    if (
      typeof responseBody === 'object' &&
      responseBody !== null &&
      'message' in responseBody
    ) {
      const message = (responseBody as { message?: string | string[] }).message;

      if (Array.isArray(message)) {
        return message.join(', ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }

    if (statusCode === 404) {
      return 'Route not found';
    }

    return 'Internal server error';
  }

  private getErrorCode(statusCode: number): string {
    switch (statusCode) {
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'ROUTE_NOT_FOUND';
      case 504:
        return 'UPSTREAM_TIMEOUT';
      case 502:
      case 503:
        return 'UPSTREAM_UNAVAILABLE';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
