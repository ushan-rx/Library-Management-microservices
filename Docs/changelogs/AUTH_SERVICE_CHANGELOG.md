# Auth Service Changelog

## 2026-03-27T18:30:00+05:30

- Scope: auth-service
- Type: chore
- Summary: Initialized Phase 0 changelog and aligned auth service bootstrap defaults with the documented service port.
- Files: apps/auth-service/src/main.ts, apps/auth-service/test/app.e2e-spec.ts
- Impact: Auth service scaffold now has the correct default port and clean baseline lint coverage.
- Notes: No API contract deviation.

## 2026-03-27T19:00:00+05:30

- Scope: auth-service
- Type: chore
- Summary: Added Prisma foundation scaffolding and documented the auth service database and environment contract for Phase 1.
- Files: apps/auth-service/prisma/schema.prisma, package.json, package-lock.json, .env.example, docs/shared/PHASE_1_DEVELOPMENT_FOUNDATION.md
- Impact: Auth service now has a validated Prisma entry point and a defined target database for later schema implementation.
- Notes: No API contract deviation.

## 2026-03-27T19:35:00+05:30

- Scope: auth-service
- Type: feature
- Summary: Implemented the Phase 3 auth foundation with Prisma-backed user storage, password hashing, JWT issuance, token validation, protected profile access, validation handling, and auth health checks.
- Files: apps/auth-service/src/auth-service.module.ts, apps/auth-service/src/main.ts, apps/auth-service/src/auth/auth.controller.ts, apps/auth-service/src/auth/auth.service.ts, apps/auth-service/src/auth/auth.guard.ts, apps/auth-service/src/auth/password.service.ts, apps/auth-service/src/prisma/prisma.service.ts, apps/auth-service/src/users/auth-user.repository.ts, apps/auth-service/src/users/in-memory-auth-user.repository.ts, apps/auth-service/src/users/prisma-auth-user.repository.ts, apps/auth-service/prisma/schema.prisma, apps/auth-service/test/app.e2e-spec.ts, package.json, package-lock.json, .env.example, README.md
- Impact: Auth Service can now run independently and supports the required register, login, profile, validate, and health workflows for the next gateway integration phase.
- Notes: No API contract deviation.

## 2026-03-28T11:15:00+05:30

- Scope: auth-service
- Type: feature
- Summary: Enabled Swagger documentation for auth routes, documented request DTOs, and added smoke tests for `/docs` and `/docs-json`.
- Files: apps/shared/configure-swagger.ts, apps/auth-service/src/bootstrap.ts, apps/auth-service/src/main.ts, apps/auth-service/src/auth/auth.controller.ts, apps/auth-service/src/auth/dto/register.dto.ts, apps/auth-service/src/auth/dto/login.dto.ts, apps/auth-service/src/auth/dto/validate-token.dto.ts, apps/auth-service/test/app.e2e-spec.ts, README.md, package.json, package-lock.json
- Impact: Auth Service now exposes usable OpenAPI documentation for register, login, validate, profile, and health workflows.
- Notes: No API contract deviation.

## 2026-03-28T20:40:00+05:30

- Scope: auth-service
- Type: chore
- Summary: Added container build support and Docker Compose runtime wiring for Auth Service, including schema preparation on container startup.
- Files: docker-compose.yml, docker/node-service.Dockerfile, package.json, README.md, docs/agents/MICROSERVICES_EVOLUTION_PLAN.md
- Impact: Auth Service can now run as an isolated container in the full local Compose stack.
- Notes: No API contract deviation.

## 2026-03-28T21:05:00+05:30

- Scope: auth-service
- Type: chore
- Summary: Added an app-owned Dockerfile and independent image build contract for Auth Service.
- Files: apps/auth-service/Dockerfile, docker-compose.yml, package.json, docs/deployment/INDEPENDENT_SERVICE_DEPLOYMENT.md
- Impact: Auth Service can now be built and deployed more explicitly as an independent container image.
- Notes: No API contract deviation.

## 2026-03-28T21:30:00+05:30

- Scope: auth-service
- Type: chore
- Summary: Added file-backed runtime configuration support for JWT and database URL inputs and documented the new configuration model.
- Files: apps/shared/config/runtime-config.util.ts, apps/shared/config/runtime-config.util.spec.ts, apps/auth-service/src/main.ts, apps/auth-service/src/auth-service.module.ts, apps/auth-service/src/prisma/prisma.service.ts, docker-compose.yml, .env.example, .env.compose.example, README.md, docs/deployment/CONFIGURATION_AND_SECRETS.md, docs/agents/MICROSERVICES_EVOLUTION_PLAN.md
- Impact: Auth Service can now resolve secrets and database configuration from mounted files as well as direct environment variables.
- Notes: No API contract deviation.

## 2026-03-28T21:55:00+05:30

- Scope: auth-service
- Type: feature
- Summary: Added shared request metrics collection and a Prometheus-style `/metrics` endpoint to Auth Service.
- Files: apps/shared/observability/metrics.service.ts, apps/shared/observability/metrics.interceptor.ts, apps/shared/observability/metrics.service.spec.ts, apps/auth-service/src/auth-service.module.ts, apps/auth-service/src/bootstrap.ts, apps/auth-service/src/metrics/metrics.controller.ts, apps/auth-service/test/app.e2e-spec.ts, README.md, docs/deployment/OBSERVABILITY.md, docs/agents/MICROSERVICES_EVOLUTION_PLAN.md
- Impact: Auth Service now exposes process-local request metrics for health visibility and scraping.
- Notes: No API contract deviation.
