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

export function categoryConflict(message: string, code: string) {
  return new ConflictException(errorBody(message, code));
}

export function categoryNotFound(message = 'Category not found') {
  return new NotFoundException(errorBody(message, 'CATEGORY_NOT_FOUND'));
}

export function categoryForbidden(message = 'Forbidden', code = 'FORBIDDEN') {
  return new ForbiddenException(errorBody(message, code));
}

export function categoryBadRequest(message: string, code: string) {
  return new BadRequestException(errorBody(message, code));
}
