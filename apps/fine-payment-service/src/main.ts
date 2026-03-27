import { NestFactory } from '@nestjs/core';
import { FinePaymentServiceModule } from './fine-payment-service.module';

async function bootstrap() {
  const app = await NestFactory.create(FinePaymentServiceModule);
  await app.listen(process.env.PORT ?? 3006);
}
void bootstrap();
