import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    username: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorizationHeader = request.header('authorization');

    if (!authorizationHeader?.startsWith('Bearer ')) {
      await this.authService.verifyAccessToken('');
    }

    const token = authorizationHeader.replace('Bearer ', '');
    request.user = await this.authService.verifyAccessToken(token);
    return true;
  }
}
