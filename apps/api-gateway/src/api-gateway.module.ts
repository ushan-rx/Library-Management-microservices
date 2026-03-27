import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { gatewayConfig } from './config/gateway.config';
import { ServiceRegistryService } from './config/service-registry.service';
import { HealthController } from './health/health.controller';
import { GatewayExceptionFilter } from './platform/errors/gateway-exception.filter';
import { RequestLoggingInterceptor } from './platform/logging/request-logging.interceptor';
import { CorrelationIdMiddleware } from './platform/request-context/correlation-id.middleware';
import { RouteAccessPolicyService } from './routing/route-access-policy.service';
import { ApiGatewayService } from './services/api-gateway.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [gatewayConfig] })],
  controllers: [HealthController],
  providers: [
    ApiGatewayService,
    ServiceRegistryService,
    RouteAccessPolicyService,
    RequestLoggingInterceptor,
    GatewayExceptionFilter,
  ],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
