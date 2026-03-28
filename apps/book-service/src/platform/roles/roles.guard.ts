import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { bookForbidden } from '../../common/book-response.helpers';
import { BookRole } from './book-role.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<BookRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const userRole = request.header('x-user-role');

    if (!userRole || !requiredRoles.includes(userRole as BookRole)) {
      this.logger.warn(
        `Book service access denied for role ${userRole ?? 'UNKNOWN'}`,
      );
      throw bookForbidden(
        'Insufficient permissions for this book operation',
        'FORBIDDEN',
      );
    }

    return true;
  }
}
