import { NestFactory } from '@nestjs/core';
import { BorrowServiceModule } from './borrow-service.module';

async function bootstrap() {
  const app = await NestFactory.create(BorrowServiceModule);
  await app.listen(process.env.PORT ?? 3005);
}
void bootstrap();
