import { Module } from '@nestjs/common';
import { FinePaymentServiceController } from './fine-payment-service.controller';
import { FinePaymentServiceService } from './fine-payment-service.service';

@Module({
  imports: [],
  controllers: [FinePaymentServiceController],
  providers: [FinePaymentServiceService],
})
export class FinePaymentServiceModule {}
