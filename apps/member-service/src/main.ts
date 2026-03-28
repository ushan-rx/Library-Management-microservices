import { NestFactory } from '@nestjs/core';
import { MemberServiceModule } from './member-service.module';
import { configureMemberServiceApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(MemberServiceModule);
  configureMemberServiceApp(app);
  await app.listen(process.env.MEMBER_SERVICE_PORT ?? process.env.PORT ?? 3002);
}
void bootstrap();
