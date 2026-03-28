import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { borrowForbidden } from '../../common/borrow-response.helpers';
import { BorrowRole } from './borrow-role.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<BorrowRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const userRole = request.header('x-user-role');

    if (!userRole || !requiredRoles.includes(userRole as BorrowRole)) {
      this.logger.warn(
        `Borrow service access denied for role ${userRole ?? 'UNKNOWN'}`,
      );
      throw borrowForbidden(
        'Insufficient permissions for this borrow operation',
        'FORBIDDEN',
      );
    }

    return true;
  }
}
