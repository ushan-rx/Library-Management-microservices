import { Injectable } from '@nestjs/common';

interface RequestMetric {
  count: number;
  durationSumMs: number;
}

@Injectable()
export class MetricsService {
  private readonly startedAt = Date.now();
  private readonly requests = new Map<string, RequestMetric>();

  recordRequest(
    method: string,
    route: string,
    statusCode: number,
    durationMs: number,
  ): void {
    const normalizedMethod = method.toUpperCase();
    const normalizedRoute = route || 'unknown';
    const key = `${normalizedMethod}|${normalizedRoute}|${statusCode}`;
    const current = this.requests.get(key) ?? {
      count: 0,
      durationSumMs: 0,
    };

    current.count += 1;
    current.durationSumMs += durationMs;
    this.requests.set(key, current);
  }

  renderPrometheus(serviceName: string): string {
    const lines = [
      '# HELP library_service_info Static service information.',
      '# TYPE library_service_info gauge',
      `library_service_info{service="${serviceName}"} 1`,
      '# HELP library_process_uptime_seconds Process uptime in seconds.',
      '# TYPE library_process_uptime_seconds gauge',
      `library_process_uptime_seconds{service="${serviceName}"} ${Math.floor(
        (Date.now() - this.startedAt) / 1000,
      )}`,
      '# HELP library_http_requests_total Total completed HTTP requests.',
      '# TYPE library_http_requests_total counter',
      '# HELP library_http_request_duration_ms_sum Total HTTP request duration in milliseconds.',
      '# TYPE library_http_request_duration_ms_sum counter',
    ];

    Array.from(this.requests.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .forEach(([key, value]) => {
        const [method, route, statusCode] = key.split('|');

        lines.push(
          `library_http_requests_total{service="${serviceName}",method="${method}",route="${route}",status_code="${statusCode}"} ${value.count}`,
        );
        lines.push(
          `library_http_request_duration_ms_sum{service="${serviceName}",method="${method}",route="${route}",status_code="${statusCode}"} ${value.durationSumMs}`,
        );
      });

    return `${lines.join('\n')}\n`;
  }
}
