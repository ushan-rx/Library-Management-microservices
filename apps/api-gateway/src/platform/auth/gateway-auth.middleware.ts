import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Response } from 'express';
import { RouteAccessPolicyService } from '../../routing/route-access-policy.service';
import { RequestWithContext } from '../request-context/request-context.types';
import { DownstreamAuthContextService } from './downstream-auth-context.service';
import { GatewayJwtPayload } from './gateway-jwt-payload.interface';

@Injectable()
export class GatewayAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly routeAccessPolicy: RouteAccessPolicyService,
    private readonly jwtService: JwtService,
    private readonly downstreamAuthContext: DownstreamAuthContextService,
  ) {}

  async use(
    request: RequestWithContext,
    _response: Response,
    next: NextFunction,
  ): Promise<void> {
    const method = request.method;
    const path = request.originalUrl ?? request.url;

    if (!this.routeAccessPolicy.isProtectedRoute(method, path)) {
      next();
      return;
    }

    const authorizationHeader = request.header('authorization');

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authorizationHeader.replace('Bearer ', '');

    try {
      const payload =
        await this.jwtService.verifyAsync<GatewayJwtPayload>(token);
      this.downstreamAuthContext.attachUserContext(request, payload);
      next();
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
