import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

function errorBody(message: string, code: string, details: unknown[] = []) {
  return {
    success: false,
    message,
    error: {
      code,
      details,
    },
  };
}

export function memberConflict(message: string, code: string) {
  return new ConflictException(errorBody(message, code));
}

export function memberNotFound(message = 'Member not found') {
  return new NotFoundException(errorBody(message, 'MEMBER_NOT_FOUND'));
}

export function memberForbidden(message = 'Forbidden', code = 'FORBIDDEN') {
  return new ForbiddenException(errorBody(message, code));
}

export function memberBadRequest(message: string, code: string) {
  return new BadRequestException(errorBody(message, code));
}
