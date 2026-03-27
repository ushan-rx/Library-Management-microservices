import { Test, TestingModule } from '@nestjs/testing';
import { MemberServiceController } from './member-service.controller';
import { MemberServiceService } from './member-service.service';

describe('MemberServiceController', () => {
  let memberServiceController: MemberServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MemberServiceController],
      providers: [MemberServiceService],
    }).compile();

    memberServiceController = app.get<MemberServiceController>(
      MemberServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(memberServiceController.getHello()).toBe('Hello World!');
    });
  });
});
