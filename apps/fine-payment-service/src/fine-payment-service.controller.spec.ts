import { Test, TestingModule } from '@nestjs/testing';
import { FinePaymentServiceController } from './fine-payment-service.controller';
import { FinePaymentServiceService } from './fine-payment-service.service';

describe('FinePaymentServiceController', () => {
  let finePaymentServiceController: FinePaymentServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FinePaymentServiceController],
      providers: [FinePaymentServiceService],
    }).compile();

    finePaymentServiceController = app.get<FinePaymentServiceController>(FinePaymentServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(finePaymentServiceController.getHello()).toBe('Hello World!');
    });
  });
});
