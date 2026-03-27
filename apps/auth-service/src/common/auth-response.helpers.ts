import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

type ErrorDetail = {
  field?: string;
  message: string;
};

function buildErrorBody(
  message: string,
  code: string,
  details: ErrorDetail[] = [],
) {
  return {
    success: false,
    message,
    error: {
      code,
      details,
    },
  };
}

export function badRequestError(
  message: string,
  code: string,
  details: ErrorDetail[] = [],
) {
  return new BadRequestException(buildErrorBody(message, code, details));
}

export function conflictError(message: string, code: string) {
  return new ConflictException(buildErrorBody(message, code));
}

export function unauthorizedError(message: string, code: string) {
  return new UnauthorizedException(buildErrorBody(message, code));
}

export function forbiddenError(message: string, code: string) {
  return new ForbiddenException(buildErrorBody(message, code));
}
