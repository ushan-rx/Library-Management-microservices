import { NestFactory } from '@nestjs/core';
import { FinePaymentServiceModule } from './fine-payment-service.module';

async function bootstrap() {
  const app = await NestFactory.create(FinePaymentServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
