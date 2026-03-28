import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

interface SwaggerSecurityOptions {
  type: 'bearer' | 'apiKey';
  schemeName: string;
  headerName?: string;
  description: string;
}

interface ConfigureSwaggerOptions {
  title: string;
  description: string;
  security?: SwaggerSecurityOptions;
}

export function configureSwagger(
  app: INestApplication,
  options: ConfigureSwaggerOptions,
): void {
  const builder = new DocumentBuilder()
    .setTitle(options.title)
    .setDescription(options.description)
    .setVersion('1.0.0');

  if (options.security?.type === 'bearer') {
    builder.addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: options.security.description,
      },
      options.security.schemeName,
    );
  }

  if (options.security?.type === 'apiKey' && options.security.headerName) {
    builder.addSecurity(options.security.schemeName, {
      type: 'apiKey',
      in: 'header',
      name: options.security.headerName,
      description: options.security.description,
    });
  }

  const document = SwaggerModule.createDocument(app, builder.build());

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
  });
}
