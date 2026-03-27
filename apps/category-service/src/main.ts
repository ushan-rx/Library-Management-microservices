import { NestFactory } from '@nestjs/core';
import { CategoryServiceModule } from './category-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CategoryServiceModule);
  await app.listen(process.env.PORT ?? 3004);
}
void bootstrap();
