import { Module } from '@nestjs/common';
import { BorrowServiceController } from './borrow-service.controller';
import { BorrowServiceService } from './borrow-service.service';

@Module({
  imports: [],
  controllers: [BorrowServiceController],
  providers: [BorrowServiceService],
})
export class BorrowServiceModule {}
