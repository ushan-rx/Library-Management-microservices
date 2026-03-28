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

export function borrowBadRequest(message: string, code: string) {
  return new BadRequestException(errorBody(message, code));
}

export function borrowConflict(message: string, code: string) {
  return new ConflictException(errorBody(message, code));
}

export function borrowForbidden(message: string, code: string) {
  return new ForbiddenException(errorBody(message, code));
}

export function borrowNotFound(message = 'Borrow record not found') {
  return new NotFoundException(errorBody(message, 'BORROW_NOT_FOUND'));
}

export function memberNotFound(message = 'Member not found') {
  return new NotFoundException(errorBody(message, 'MEMBER_NOT_FOUND'));
}

export function bookNotFound(message = 'Book not found') {
  return new NotFoundException(errorBody(message, 'BOOK_NOT_FOUND'));
}

export function borrowServiceUnavailable(message: string, code: string) {
  return new ServiceUnavailableException(errorBody(message, code));
}
