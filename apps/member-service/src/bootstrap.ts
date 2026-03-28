import { INestApplication, ValidationPipe } from '@nestjs/common';
import { validationExceptionFactory } from './common/validation-exception.factory';

export function configureMemberServiceApp(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );
}
