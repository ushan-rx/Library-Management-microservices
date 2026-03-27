import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestWithContext } from '../request-context/request-context.types';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithContext>();
    const response = httpContext.getResponse<{ statusCode: number }>();
    const startedAt = request.requestStartedAt ?? Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              level: 'log',
              service: process.env.API_GATEWAY_SERVICE_NAME ?? 'api-gateway',
              correlationId: request.correlationId,
              method: request.method,
              route: request.originalUrl ?? request.url,
              statusCode: response.statusCode,
              durationMs: Date.now() - startedAt,
            }),
          );
        },
        error: (error: unknown) => {
          const statusCode =
            typeof error === 'object' &&
            error !== null &&
            'status' in error &&
            typeof (error as { status?: unknown }).status === 'number'
              ? ((error as { status: number }).status ?? 500)
              : 500;

          this.logger.error(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              level: 'error',
              service: process.env.API_GATEWAY_SERVICE_NAME ?? 'api-gateway',
              correlationId: request.correlationId,
              method: request.method,
              route: request.originalUrl ?? request.url,
              statusCode,
              durationMs: Date.now() - startedAt,
            }),
          );
        },
      }),
    );
  }
}
