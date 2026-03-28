import { All, Controller, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { GatewayAuthService } from '../platform/auth/gateway-auth.service';
import { RequestWithContext } from '../platform/request-context/request-context.types';
import { GatewayProxyService } from './gateway-proxy.service';
import { RouteAccessPolicyService } from './route-access-policy.service';

@Controller()
export class GatewayProxyController {
  constructor(
    private readonly routeAccessPolicy: RouteAccessPolicyService,
    private readonly gatewayAuthService: GatewayAuthService,
    private readonly gatewayProxyService: GatewayProxyService,
  ) {}

  @All('*')
  async proxy(
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    if (!this.routeAccessPolicy.isPublicRoute(request.method, request.path)) {
      await this.gatewayAuthService.authenticateRequest(request);
    }

    await this.gatewayProxyService.forward(request, response);
  }
}
