import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from '../../../shared/observability/metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('content-type', 'text/plain; version=0.0.4; charset=utf-8')
  metrics(): string {
    return this.metricsService.renderPrometheus('fine-payment-service');
  }
}
