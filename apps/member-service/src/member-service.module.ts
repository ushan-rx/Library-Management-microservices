import { Module } from '@nestjs/common';
import { MemberServiceController } from './member-service.controller';
import { MemberServiceService } from './member-service.service';

@Module({
  imports: [],
  controllers: [MemberServiceController],
  providers: [MemberServiceService],
})
export class MemberServiceModule {}
