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
      'Gateway operational endpoints and documentation entry point for the library system.',
  });
}
