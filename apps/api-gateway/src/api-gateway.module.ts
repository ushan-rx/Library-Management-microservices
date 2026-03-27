import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { gatewayConfig } from './config/gateway.config';
import { ServiceRegistryService } from './config/service-registry.service';
import { HealthController } from './health/health.controller';
import { DownstreamAuthContextService } from './platform/auth/downstream-auth-context.service';
import { GatewayAuthMiddleware } from './platform/auth/gateway-auth.middleware';
import { GatewayExceptionFilter } from './platform/errors/gateway-exception.filter';
import { RequestLoggingInterceptor } from './platform/logging/request-logging.interceptor';
import { CorrelationIdMiddleware } from './platform/request-context/correlation-id.middleware';
import { RouteAccessPolicyService } from './routing/route-access-policy.service';
import { ApiGatewayService } from './services/api-gateway.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [gatewayConfig],
      envFilePath: ['.env', '.env.example'],
    }),
    JwtModule.registerAsync({
      inject: [],
      useFactory: () => ({
        secret: process.env.JWT_SECRET ?? 'change-me-in-local-env',
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [
    ApiGatewayService,
    ServiceRegistryService,
    RouteAccessPolicyService,
    DownstreamAuthContextService,
    GatewayAuthMiddleware,
    RequestLoggingInterceptor,
    GatewayExceptionFilter,
  ],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, GatewayAuthMiddleware)
      .forRoutes('*');
  }
}
