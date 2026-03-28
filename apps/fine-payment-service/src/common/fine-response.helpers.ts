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

export function fineBadRequest(message: string, code: string) {
  return new BadRequestException(errorBody(message, code));
}

export function fineConflict(message: string, code: string) {
  return new ConflictException(errorBody(message, code));
}

export function fineForbidden(message = 'Forbidden', code = 'FORBIDDEN') {
  return new ForbiddenException(errorBody(message, code));
}

export function fineNotFound(message = 'Fine not found') {
  return new NotFoundException(errorBody(message, 'FINE_NOT_FOUND'));
}
