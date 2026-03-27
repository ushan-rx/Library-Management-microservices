import { Test, TestingModule } from '@nestjs/testing';
import { BorrowServiceController } from './borrow-service.controller';
import { BorrowServiceService } from './borrow-service.service';

describe('BorrowServiceController', () => {
  let borrowServiceController: BorrowServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BorrowServiceController],
      providers: [BorrowServiceService],
    }).compile();

    borrowServiceController = app.get<BorrowServiceController>(BorrowServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(borrowServiceController.getHello()).toBe('Hello World!');
    });
  });
});
