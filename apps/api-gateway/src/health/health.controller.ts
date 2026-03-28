import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiGatewayService } from '../services/api-gateway.service';

@Controller()
@ApiTags('gateway')
export class HealthController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get API Gateway health status' })
  getHealth() {
    return this.apiGatewayService.getHealth();
  }
}
