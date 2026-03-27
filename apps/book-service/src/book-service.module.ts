import { Module } from '@nestjs/common';
import { BookServiceController } from './book-service.controller';
import { BookServiceService } from './book-service.service';

@Module({
  imports: [],
  controllers: [BookServiceController],
  providers: [BookServiceService],
})
export class BookServiceModule {}
