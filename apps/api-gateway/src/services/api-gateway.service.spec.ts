import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { gatewayConfig } from '../config/gateway.config';
import { ServiceRegistryService } from '../config/service-registry.service';
import { RouteAccessPolicyService } from '../routing/route-access-policy.service';
import { ApiGatewayService } from './api-gateway.service';

describe('ApiGatewayService', () => {
  let apiGatewayService: ApiGatewayService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [gatewayConfig] }),
      ],
      providers: [
        ServiceRegistryService,
        RouteAccessPolicyService,
        ApiGatewayService,
      ],
    }).compile();

    apiGatewayService = moduleRef.get(ApiGatewayService);
  });

  it('returns the gateway health summary', () => {
    const health = apiGatewayService.getHealth();

    expect(health.success).toBe(true);
    expect(health.message).toBe('Gateway healthy');
    expect(health.data.service).toBe('api-gateway');
    expect(health.data.status).toBe('UP');
    expect(health.data.publicRoutes).toContain('/health');
    expect(health.data.routeGroups).toEqual(
      expect.arrayContaining([
        'auth',
        'member',
        'book',
        'category',
        'borrow',
        'finePayment',
      ]),
    );
  });
});
