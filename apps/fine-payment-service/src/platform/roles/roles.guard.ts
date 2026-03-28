import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { fineForbidden } from '../../common/fine-response.helpers';
import { FineRole } from './fine-role.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<FineRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const userRole = request.header('x-user-role');

    if (!userRole || !requiredRoles.includes(userRole as FineRole)) {
      this.logger.warn(
        `Fine service access denied for role ${userRole ?? 'UNKNOWN'}`,
      );
      throw fineForbidden(
        'Insufficient permissions for this fine operation',
        'FORBIDDEN',
      );
    }

    return true;
  }
}
