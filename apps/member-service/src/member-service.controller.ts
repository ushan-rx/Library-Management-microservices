import { Controller, Get } from '@nestjs/common';
import { MemberServiceService } from './member-service.service';

@Controller()
export class MemberServiceController {
  constructor(private readonly memberServiceService: MemberServiceService) {}

  @Get()
  getHello(): string {
    return this.memberServiceService.getHello();
  }
}
