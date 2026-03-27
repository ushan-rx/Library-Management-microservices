import { Controller, Get } from '@nestjs/common';
import { FinePaymentServiceService } from './fine-payment-service.service';

@Controller()
export class FinePaymentServiceController {
  constructor(private readonly finePaymentServiceService: FinePaymentServiceService) {}

  @Get()
  getHello(): string {
    return this.finePaymentServiceService.getHello();
  }
}
