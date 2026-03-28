import { NestFactory } from '@nestjs/core';
import { BorrowServiceModule } from './borrow-service.module';
import { configureBorrowServiceApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(BorrowServiceModule);
  configureBorrowServiceApp(app);
  await app.listen(process.env.BORROW_SERVICE_PORT ?? process.env.PORT ?? 3005);
}
void bootstrap();
