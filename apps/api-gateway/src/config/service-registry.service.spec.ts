import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { gatewayConfig } from './gateway.config';
import { ServiceRegistryService } from './service-registry.service';

describe('ServiceRegistryService', () => {
  let serviceRegistry: ServiceRegistryService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [gatewayConfig] }),
      ],
      providers: [ServiceRegistryService],
    }).compile();

    serviceRegistry = moduleRef.get(ServiceRegistryService);
  });

  it('returns downstream targets for all route groups', () => {
    const targets = serviceRegistry.getTargets();

    expect(targets.auth.basePath).toBe('/auth');
    expect(targets.member.basePath).toBe('/members');
    expect(targets.book.basePath).toBe('/books');
    expect(targets.category.basePath).toBe('/categories');
    expect(targets.borrow.basePath).toBe('/borrows');
    expect(targets.finePayment.basePath).toBe('/fines');
  });

  it('defines the gateway public and protected route structure', () => {
    expect(serviceRegistry.getPublicRoutePrefixes()).toEqual(
      expect.arrayContaining(['/health', '/auth/register', '/auth/login']),
    );
    expect(serviceRegistry.getProtectedRoutePrefixes()).toEqual(
      expect.arrayContaining([
        '/auth/profile',
        '/members',
        '/categories',
        '/books',
        '/borrows',
        '/fines',
      ]),
    );
  });

  it('resolves downstream targets from request paths', () => {
    expect(serviceRegistry.resolveTarget('/auth/login')?.baseUrl).toContain(
      '3001',
    );
    expect(serviceRegistry.resolveTarget('/members/123')?.baseUrl).toContain(
      '3002',
    );
    expect(serviceRegistry.resolveTarget('/missing')).toBeNull();
  });
});
