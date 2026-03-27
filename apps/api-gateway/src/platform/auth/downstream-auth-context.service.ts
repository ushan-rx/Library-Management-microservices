import { Injectable } from '@nestjs/common';
import { GatewayJwtPayload } from './gateway-jwt-payload.interface';
import { RequestWithContext } from '../request-context/request-context.types';

@Injectable()
export class DownstreamAuthContextService {
  attachUserContext(
    request: RequestWithContext,
    payload: GatewayJwtPayload,
  ): void {
    request.authenticatedUser = {
      id: payload.sub,
      role: payload.role,
      username: payload.username,
      email: payload.email,
    };

    request.forwardHeaders = {
      'x-user-id': payload.sub,
      'x-user-role': payload.role,
      'x-username': payload.username,
      'x-correlation-id': request.correlationId ?? '',
    };
  }
}
