import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { gatewayConfig } from '../config/gateway.config';
import { ServiceRegistryService } from '../config/service-registry.service';
import { RouteAccessPolicyService } from './route-access-policy.service';

describe('RouteAccessPolicyService', () => {
  let routeAccessPolicy: RouteAccessPolicyService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [gatewayConfig] }),
      ],
      providers: [ServiceRegistryService, RouteAccessPolicyService],
    }).compile();

    routeAccessPolicy = moduleRef.get(RouteAccessPolicyService);
  });

  it('marks only the expected gateway routes as public', () => {
    expect(routeAccessPolicy.isPublicRoute('GET', '/health')).toBe(true);
    expect(routeAccessPolicy.isPublicRoute('POST', '/auth/register')).toBe(
      true,
    );
    expect(routeAccessPolicy.isPublicRoute('POST', '/auth/login')).toBe(true);
    expect(routeAccessPolicy.isPublicRoute('GET', '/members')).toBe(false);
    expect(routeAccessPolicy.isPublicRoute('GET', '/auth/profile')).toBe(false);
  });

  it('marks protected route groups for auth enforcement', () => {
    expect(routeAccessPolicy.isProtectedRoute('GET', '/members')).toBe(true);
    expect(routeAccessPolicy.isProtectedRoute('GET', '/members/123')).toBe(
      true,
    );
    expect(routeAccessPolicy.isProtectedRoute('GET', '/auth/profile')).toBe(
      true,
    );
    expect(routeAccessPolicy.isProtectedRoute('POST', '/auth/login')).toBe(
      false,
    );
    expect(routeAccessPolicy.isProtectedRoute('GET', '/health')).toBe(false);
  });

  it('summarizes the policy using the gateway route skeleton', () => {
    const summary = routeAccessPolicy.getPolicySummary();

    expect(summary.publicRoutes).toContain('/health');
    expect(summary.protectedPrefixes).toContain('/borrows');
  });
});
