import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  it('renders prometheus-style request metrics', () => {
    const service = new MetricsService();

    service.recordRequest('get', '/health', 200, 15);
    service.recordRequest('get', '/health', 200, 10);
    service.recordRequest('post', '/auth/login', 401, 7);

    const metrics = service.renderPrometheus('api-gateway');

    expect(metrics).toContain(
      'library_service_info{service="api-gateway"} 1',
    );
    expect(metrics).toContain(
      'library_http_requests_total{service="api-gateway",method="GET",route="/health",status_code="200"} 2',
    );
    expect(metrics).toContain(
      'library_http_request_duration_ms_sum{service="api-gateway",method="GET",route="/health",status_code="200"} 25',
    );
    expect(metrics).toContain(
      'library_http_requests_total{service="api-gateway",method="POST",route="/auth/login",status_code="401"} 1',
    );
  });
});
