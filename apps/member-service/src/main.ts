import { NestFactory } from '@nestjs/core';
import { MemberServiceModule } from './member-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MemberServiceModule);
  await app.listen(process.env.PORT ?? 3002);
}
void bootstrap();
