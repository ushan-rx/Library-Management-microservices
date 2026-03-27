import { Test, TestingModule } from '@nestjs/testing';
import { BookServiceController } from './book-service.controller';
import { BookServiceService } from './book-service.service';

describe('BookServiceController', () => {
  let bookServiceController: BookServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BookServiceController],
      providers: [BookServiceService],
    }).compile();

    bookServiceController = app.get<BookServiceController>(BookServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(bookServiceController.getHello()).toBe('Hello World!');
    });
  });
});
