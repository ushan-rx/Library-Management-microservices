import { Injectable } from '@nestjs/common';

@Injectable()
export class BookServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
