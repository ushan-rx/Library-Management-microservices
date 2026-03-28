import { INestApplication } from '@nestjs/common';
import { configureSwagger } from '../../shared/configure-swagger';
import { MetricsInterceptor } from '../../shared/observability/metrics.interceptor';
import { GatewayExceptionFilter } from './platform/errors/gateway-exception.filter';
import { RequestLoggingInterceptor } from './platform/logging/request-logging.interceptor';

export function configureGatewayApp(app: INestApplication): void {
  app.useGlobalInterceptors(
    app.get(MetricsInterceptor),
    app.get(RequestLoggingInterceptor),
  );
  app.useGlobalFilters(app.get(GatewayExceptionFilter));
  configureSwagger(app, {
    title: 'API Gateway',
    description:
      'Gateway operational endpoints and public API entry point for the library system. Use this for signup, login, protected route access, and service forwarding.',
    security: {
      type: 'bearer',
      schemeName: 'bearer',
      description:
        'JWT bearer token used for protected routes forwarded by the API Gateway.',
    },
  });
}
