import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
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

export function bookConflict(message: string, code: string) {
  return new ConflictException(errorBody(message, code));
}

export function bookNotFound(message = 'Book not found') {
  return new NotFoundException(errorBody(message, 'BOOK_NOT_FOUND'));
}

export function bookForbidden(message = 'Forbidden', code = 'FORBIDDEN') {
  return new ForbiddenException(errorBody(message, code));
}

export function bookBadRequest(message: string, code: string) {
  return new BadRequestException(errorBody(message, code));
}

export function bookServiceUnavailable(message: string, code: string) {
  return new ServiceUnavailableException(errorBody(message, code));
}
