import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestWithContext } from '../request-context/request-context.types';

interface GatewayJwtPayload {
  sub: string;
  role: string;
  username?: string;
}

@Injectable()
export class GatewayAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async authenticateRequest(request: RequestWithContext): Promise<void> {
    const authorizationHeader = request.header('authorization');
    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        success: false,
        message: 'Missing bearer token',
        error: {
          code: 'UNAUTHORIZED',
          details: [],
        },
      });
    }

    const token = authorizationHeader.slice('Bearer '.length);

    try {
      const payload =
        await this.jwtService.verifyAsync<GatewayJwtPayload>(token);
      request.authenticatedUser = {
        id: payload.sub,
        role: payload.role,
        username: payload.username,
      };
    } catch {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid bearer token',
        error: {
          code: 'UNAUTHORIZED',
          details: [],
        },
      });
    }
  }
}
