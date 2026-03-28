import { INestApplication, ValidationPipe } from '@nestjs/common';
import { configureSwagger } from '../../shared/configure-swagger';
import { validationExceptionFactory } from './common/validation-exception.factory';

export function configureBorrowServiceApp(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );
  configureSwagger(app, {
    title: 'Borrow Service',
    description:
      'Borrow orchestration, return processing, and overdue status routes.',
    security: {
      type: 'apiKey',
      schemeName: 'x-user-role',
      headerName: 'x-user-role',
      description:
        'Trusted role header required for protected direct service routes.',
    },
  });
}
