import { INestApplication, ValidationPipe } from '@nestjs/common';
import { configureSwagger } from '../../shared/configure-swagger';
import { validationExceptionFactory } from './common/validation-exception.factory';

export function configureAuthServiceApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );
  configureSwagger(app, {
    title: 'Auth Service',
    description:
      'Authentication, token issuance, token validation, and authenticated profile routes.',
    security: {
      type: 'bearer',
      schemeName: 'bearer',
      description:
        'JWT bearer token used for authenticated auth-service routes.',
    },
  });
}
