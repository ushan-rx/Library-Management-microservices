import { NestFactory } from '@nestjs/core';
import { BookServiceModule } from './book-service.module';
import { configureBookServiceApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(BookServiceModule);
  configureBookServiceApp(app);
  await app.listen(process.env.BOOK_SERVICE_PORT ?? process.env.PORT ?? 3003);
}
void bootstrap();
