import { NestFactory } from '@nestjs/core';
import { loadFileBackedEnvironment } from '../../shared/config/runtime-config.util';
import { BorrowServiceModule } from './borrow-service.module';
import { configureBorrowServiceApp } from './bootstrap';

async function bootstrap() {
  loadFileBackedEnvironment();
  const app = await NestFactory.create(BorrowServiceModule);
  configureBorrowServiceApp(app);
  await app.listen(process.env.BORROW_SERVICE_PORT ?? process.env.PORT ?? 3005);
}
void bootstrap();
