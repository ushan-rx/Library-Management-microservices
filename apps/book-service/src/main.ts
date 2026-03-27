import { NestFactory } from '@nestjs/core';
import { BookServiceModule } from './book-service.module';

async function bootstrap() {
  const app = await NestFactory.create(BookServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
