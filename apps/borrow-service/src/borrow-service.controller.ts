import { Controller, Get } from '@nestjs/common';
import { BorrowServiceService } from './borrow-service.service';

@Controller()
export class BorrowServiceController {
  constructor(private readonly borrowServiceService: BorrowServiceService) {}

  @Get()
  getHello(): string {
    return this.borrowServiceService.getHello();
  }
}
