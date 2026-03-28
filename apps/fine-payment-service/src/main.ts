import { NestFactory } from '@nestjs/core';
import { FinePaymentServiceModule } from './fine-payment-service.module';
import { configureFinePaymentServiceApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(FinePaymentServiceModule);
  configureFinePaymentServiceApp(app);
  await app.listen(
    process.env.FINE_PAYMENT_SERVICE_PORT ?? process.env.PORT ?? 3006,
  );
}
void bootstrap();
