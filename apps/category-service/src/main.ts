import { NestFactory } from '@nestjs/core';
import { CategoryServiceModule } from './category-service.module';
import { configureCategoryServiceApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(CategoryServiceModule);
  configureCategoryServiceApp(app);
  await app.listen(
    process.env.CATEGORY_SERVICE_PORT ?? process.env.PORT ?? 3004,
  );
}
void bootstrap();
