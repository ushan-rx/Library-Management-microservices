import { registerAs } from '@nestjs/config';

export const gatewayConfig = registerAs('gateway', () => ({
  serviceName: process.env.API_GATEWAY_SERVICE_NAME ?? 'api-gateway',
  port: Number.parseInt(
    process.env.API_GATEWAY_PORT ?? process.env.PORT ?? '3000',
    10,
  ),
  logLevel: process.env.LOG_LEVEL ?? 'debug',
  corsAllowedOrigins:
    process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-local-env',
  services: {
    auth: process.env.AUTH_SERVICE_BASE_URL ?? 'http://localhost:3001',
    member: process.env.MEMBER_SERVICE_BASE_URL ?? 'http://localhost:3002',
    book: process.env.BOOK_SERVICE_BASE_URL ?? 'http://localhost:3003',
    category: process.env.CATEGORY_SERVICE_BASE_URL ?? 'http://localhost:3004',
    borrow: process.env.BORROW_SERVICE_BASE_URL ?? 'http://localhost:3005',
    finePayment:
      process.env.FINE_PAYMENT_SERVICE_BASE_URL ?? 'http://localhost:3006',
  },
}));

export type GatewayConfig = ReturnType<typeof gatewayConfig>;
