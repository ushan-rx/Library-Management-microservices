import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { configureAuthServiceApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  configureAuthServiceApp(app);
  await app.listen(process.env.AUTH_SERVICE_PORT ?? process.env.PORT ?? 3001);
}
void bootstrap();
