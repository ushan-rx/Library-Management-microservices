import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { GatewayAuthMiddleware } from './gateway-auth.middleware';
import { DownstreamAuthContextService } from './downstream-auth-context.service';
import { RequestWithContext } from '../request-context/request-context.types';
import { RouteAccessPolicyService } from '../../routing/route-access-policy.service';

describe('GatewayAuthMiddleware', () => {
  let middleware: GatewayAuthMiddleware;

  beforeEach(() => {
    const jwtService = new JwtService({ secret: 'test-secret' });
    const routeAccessPolicy = {
      isProtectedRoute: jest.fn(
        (method: string, path: string) =>
          method === 'GET' && path.startsWith('/members'),
      ),
    } as unknown as RouteAccessPolicyService;

    middleware = new GatewayAuthMiddleware(
      routeAccessPolicy,
      jwtService,
      new DownstreamAuthContextService(),
    );
  });

  it('allows public routes without requiring a token', async () => {
    const request = {
      method: 'GET',
      originalUrl: '/health',
      header: jest.fn(),
    } as unknown as RequestWithContext;
    const next = jest.fn();

    await middleware.use(request, {} as never, next);

    expect(next).toHaveBeenCalled();
  });

  it('rejects missing bearer tokens for protected routes', async () => {
    const request = {
      method: 'GET',
      originalUrl: '/members',
      header: jest.fn(() => undefined),
    } as unknown as RequestWithContext;

    await expect(
      middleware.use(request, {} as never, jest.fn()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
