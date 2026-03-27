import { Controller, Get } from '@nestjs/common';
import { BookServiceService } from './book-service.service';

@Controller()
export class BookServiceController {
  constructor(private readonly bookServiceService: BookServiceService) {}

  @Get()
  getHello(): string {
    return this.bookServiceService.getHello();
  }
}
