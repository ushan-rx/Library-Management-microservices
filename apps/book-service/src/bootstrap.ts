import { INestApplication, ValidationPipe } from '@nestjs/common';
import { configureSwagger } from '../../shared/configure-swagger';
import { validationExceptionFactory } from './common/validation-exception.factory';

export function configureBookServiceApp(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );
  configureSwagger(app, {
    title: 'Book Service',
    description: 'Book catalog, availability, and inventory adjustment routes.',
    security: {
      type: 'apiKey',
      schemeName: 'x-user-role',
      headerName: 'x-user-role',
      description:
        'Trusted role header required for protected direct service routes.',
    },
  });
}
