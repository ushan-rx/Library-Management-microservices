import { All, Controller, Req, Res } from '@nestjs/common';
import { GatewayAuthService } from '../platform/auth/gateway-auth.service';
import { GatewayProxyService } from './gateway-proxy.service';
import { RouteAccessPolicyService } from './route-access-policy.service';
import type { Response } from 'express';
import type { RequestWithContext } from '../platform/request-context/request-context.types';

@Controller()
export class GatewayProxyController {
  constructor(
    private readonly routeAccessPolicy: RouteAccessPolicyService,
    private readonly gatewayAuthService: GatewayAuthService,
    private readonly gatewayProxyService: GatewayProxyService,
  ) {}

  @All([
    'auth',
    'auth/*path',
    'members',
    'members/*path',
    'categories',
    'categories/*path',
    'books',
    'books/*path',
    'borrows',
    'borrows/*path',
    'fines',
    'fines/*path',
  ])
  async forward(
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    if (!this.routeAccessPolicy.isPublicRoute(request.method, request.path)) {
      await this.gatewayAuthService.authenticateRequest(request);
    }

    await this.gatewayProxyService.forward(request, response);
  }
}
