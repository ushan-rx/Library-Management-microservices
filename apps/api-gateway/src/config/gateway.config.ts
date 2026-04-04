import { registerAs } from '@nestjs/config';
import { resolveProcessEnvValue } from '../../../shared/config/runtime-config.util';

export const gatewayConfig = registerAs('gateway', () => ({
  serviceName: resolveProcessEnvValue('API_GATEWAY_SERVICE_NAME', 'api-gateway'),
  port: Number.parseInt(
    resolveProcessEnvValue('API_GATEWAY_PORT') ??
      resolveProcessEnvValue('PORT', '3000') ??
      '3000',
    10,
  ),
  logLevel: resolveProcessEnvValue('LOG_LEVEL', 'debug'),
  corsAllowedOrigins: resolveProcessEnvValue(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000',
  ),
  jwtSecret: resolveProcessEnvValue('JWT_SECRET', 'change-me-in-local-env'),
  services: {
    auth: resolveProcessEnvValue(
      'AUTH_SERVICE_BASE_URL',
      'http://localhost:3001',
    ),
    member: resolveProcessEnvValue(
      'MEMBER_SERVICE_BASE_URL',
      'http://localhost:3002',
    ),
    book: resolveProcessEnvValue(
      'BOOK_SERVICE_BASE_URL',
      'http://localhost:3003',
    ),
    category: resolveProcessEnvValue(
      'CATEGORY_SERVICE_BASE_URL',
      'http://localhost:3004',
    ),
    borrow: resolveProcessEnvValue(
      'BORROW_SERVICE_BASE_URL',
      'http://localhost:3005',
    ),
    finePayment: resolveProcessEnvValue(
      'FINE_PAYMENT_SERVICE_BASE_URL',
      'http://localhost:3006',
    ),
  },
}));

export type GatewayConfig = ReturnType<typeof gatewayConfig>;
