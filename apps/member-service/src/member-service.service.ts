import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
