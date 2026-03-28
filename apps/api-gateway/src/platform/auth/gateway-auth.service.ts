import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestWithContext } from '../request-context/request-context.types';
import { GatewayJwtPayload } from './gateway-jwt-payload.interface';

interface AuthValidationResponse {
  success: boolean;
  data?: {
    valid: boolean;
    user: {
      id: string;
      username: string;
      role: string;
    };
  };
}

@Injectable()
export class GatewayAuthService {
  constructor(private readonly configService: ConfigService) {}

  async authenticateRequest(
    request: RequestWithContext,
  ): Promise<GatewayJwtPayload> {
    const authorizationHeader = request.header('authorization');

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token is required');
    }

    const token = authorizationHeader.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Authorization token is required');
    }

    const validationResponse = await fetch(
      `${this.authServiceBaseUrl()}/auth/validate`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ token }),
      },
    ).catch(() => {
      throw new UnauthorizedException('Invalid token');
    });

    if (!validationResponse.ok) {
      throw new UnauthorizedException('Invalid token');
    }

    const validationBody =
      (await validationResponse.json()) as AuthValidationResponse;

    if (!validationBody.success || !validationBody.data?.valid) {
      throw new UnauthorizedException('Invalid token');
    }

    const payload: GatewayJwtPayload = {
      sub: validationBody.data.user.id,
      username: validationBody.data.user.username,
      email: '',
      role: validationBody.data.user.role,
    };

    request.authenticatedUser = {
      id: payload.sub,
      role: payload.role,
      username: payload.username,
    };

    return payload;
  }

  private authServiceBaseUrl(): string {
    return (
      this.configService.get<string>('AUTH_SERVICE_BASE_URL') ??
      'http://localhost:3001'
    );
  }
}
