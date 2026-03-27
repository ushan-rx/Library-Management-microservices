import { INestApplication } from '@nestjs/common';
import { GatewayExceptionFilter } from './platform/errors/gateway-exception.filter';
import { RequestLoggingInterceptor } from './platform/logging/request-logging.interceptor';

export function configureGatewayApp(app: INestApplication): void {
  app.useGlobalInterceptors(app.get(RequestLoggingInterceptor));
  app.useGlobalFilters(app.get(GatewayExceptionFilter));
}
