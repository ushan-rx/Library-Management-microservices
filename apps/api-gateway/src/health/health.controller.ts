import { Controller, Get } from '@nestjs/common';
import { ApiGatewayService } from '../services/api-gateway.service';

@Controller()
export class HealthController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('health')
  getHealth() {
    return this.apiGatewayService.getHealth();
  }
}
