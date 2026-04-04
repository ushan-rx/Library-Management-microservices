import { NestFactory } from '@nestjs/core';
import { loadFileBackedEnvironment } from '../../shared/config/runtime-config.util';
import { AuthServiceModule } from './auth-service.module';
import { configureAuthServiceApp } from './bootstrap';

async function bootstrap() {
  loadFileBackedEnvironment();
  const app = await NestFactory.create(AuthServiceModule);
  configureAuthServiceApp(app);
  await app.listen(process.env.AUTH_SERVICE_PORT ?? process.env.PORT ?? 3001);
}
void bootstrap();
