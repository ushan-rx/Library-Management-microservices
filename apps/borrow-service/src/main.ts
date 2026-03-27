import { NestFactory } from '@nestjs/core';
import { BorrowServiceModule } from './borrow-service.module';

async function bootstrap() {
  const app = await NestFactory.create(BorrowServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
