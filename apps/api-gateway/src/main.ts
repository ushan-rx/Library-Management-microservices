import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { configureGatewayApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  configureGatewayApp(app);
  await app.listen(process.env.API_GATEWAY_PORT ?? process.env.PORT ?? 3000);
}
void bootstrap();
