import { NestFactory } from '@nestjs/core';
import { MemberServiceModule } from './member-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MemberServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
