# API Gateway Changelog

## 2026-03-27T18:30:00+05:30

- Scope: api-gateway
- Type: chore
- Summary: Initialized Phase 0 changelog and corrected baseline monorepo scaffold references for gateway bootstrap and workspace scripts.
- Files: package.json, nest-cli.json, apps/api-gateway/src/main.ts, apps/api-gateway/test/app.e2e-spec.ts
- Impact: Gateway scaffold now participates correctly in workspace build, lint, and test checks.
- Notes: No API contract deviation.

## 2026-03-27T19:00:00+05:30

- Scope: api-gateway
- Type: chore
- Summary: Established the Phase 1 shared foundation with Dockerized PostgreSQL, shared environment variables, gateway base config entries, and request-correlation documentation.
- Files: package.json, package-lock.json, .env.example, docker-compose.yml, docs/shared/PHASE_1_DEVELOPMENT_FOUNDATION.md, README.md
- Impact: Gateway and downstream services now have a documented startup contract and a reusable resource layer for future implementation phases.
- Notes: No API contract deviation.

## 2026-03-27T19:25:00+05:30

- Scope: api-gateway
- Type: feature
- Summary: Implemented the Phase 2 gateway skeleton with a `/health` endpoint, typed service registry, route access policy, correlation ID middleware, request logging, and normalized error handling.
- Files: apps/api-gateway/src/api-gateway.module.ts, apps/api-gateway/src/main.ts, apps/api-gateway/src/bootstrap.ts, apps/api-gateway/src/config/gateway.config.ts, apps/api-gateway/src/config/service-registry.service.ts, apps/api-gateway/src/routing/route-access-policy.service.ts, apps/api-gateway/src/health/health.controller.ts, apps/api-gateway/src/services/api-gateway.service.ts, apps/api-gateway/src/platform/request-context/correlation-id.middleware.ts, apps/api-gateway/src/platform/logging/request-logging.interceptor.ts, apps/api-gateway/src/platform/errors/gateway-exception.filter.ts, apps/api-gateway/test/app.e2e-spec.ts, README.md
- Impact: The gateway can now boot as a real entry-point skeleton and be checked locally through health, correlation ID propagation, and error normalization behavior.
- Notes: No API contract deviation.

## 2026-03-27T20:05:00+05:30

- Scope: api-gateway
- Type: feature
- Summary: Implemented gateway JWT enforcement for protected route groups, preserved public auth routes, and added trusted downstream auth-context preparation for later route forwarding.
- Files: apps/api-gateway/src/api-gateway.module.ts, apps/api-gateway/src/platform/auth/gateway-auth.middleware.ts, apps/api-gateway/src/platform/auth/downstream-auth-context.service.ts, apps/api-gateway/src/platform/auth/gateway-jwt-payload.interface.ts, apps/api-gateway/src/platform/request-context/request-context.types.ts, apps/api-gateway/src/routing/route-access-policy.service.ts, apps/api-gateway/test/app.e2e-spec.ts, README.md
- Impact: The gateway now rejects missing and invalid tokens on protected route groups and is ready to pass trusted auth context into downstream forwarding logic in later phases.
- Notes: No API contract deviation.
