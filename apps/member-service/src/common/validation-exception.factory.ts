import { BadRequestException, ValidationError } from '@nestjs/common';

export function validationExceptionFactory(errors: ValidationError[]) {
  return new BadRequestException({
    success: false,
    message: 'Validation failed',
    error: {
      code: 'VALIDATION_ERROR',
      details: errors.flatMap((error) =>
        Object.values(error.constraints ?? {}).map((message) => ({
          field: error.property,
          message,
        })),
      ),
    },
  });
}
