import { Injectable } from '@nestjs/common';

@Injectable()
export class BorrowServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
