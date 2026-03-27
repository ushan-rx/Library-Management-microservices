import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ApiGatewayModule } from './api-gateway.module';

describe('ApiGatewayModule', () => {
  it('compiles with the gateway foundation providers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    expect(moduleRef.get(ApiGatewayModule)).toBeDefined();
    expect(moduleRef.get(ConfigService)).toBeDefined();
  });
});
