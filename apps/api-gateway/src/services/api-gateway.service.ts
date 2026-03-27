import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RouteAccessPolicyService } from '../routing/route-access-policy.service';
import { ServiceRegistryService } from '../config/service-registry.service';

@Injectable()
export class ApiGatewayService {
  constructor(
    private readonly configService: ConfigService,
    private readonly routeAccessPolicy: RouteAccessPolicyService,
    private readonly serviceRegistry: ServiceRegistryService,
  ) {}

  getHealth() {
    return {
      success: true,
      message: 'Gateway healthy',
      data: {
        service:
          this.configService.get<string>('API_GATEWAY_SERVICE_NAME') ??
          'api-gateway',
        status: 'UP',
        timestamp: new Date().toISOString(),
        publicRoutes: this.routeAccessPolicy.getPolicySummary().publicRoutes,
        routeGroups: Object.keys(this.serviceRegistry.getTargets()),
      },
    };
  }
}
