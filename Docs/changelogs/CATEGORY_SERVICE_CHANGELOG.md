# Category Service Changelog

## 2026-03-27T18:30:00+05:30

- Scope: category-service
- Type: chore
- Summary: Initialized Phase 0 changelog and aligned category service bootstrap defaults with the documented service port.
- Files: apps/category-service/src/main.ts, apps/category-service/test/app.e2e-spec.ts
- Impact: Category service scaffold now has the correct default port and clean baseline lint coverage.
- Notes: No API contract deviation.

## 2026-03-27T19:00:00+05:30

- Scope: category-service
- Type: chore
- Summary: Added Prisma foundation scaffolding and documented the category service database and environment contract for Phase 1.
- Files: apps/category-service/prisma/schema.prisma, package.json, package-lock.json, .env.example, docs/shared/PHASE_1_DEVELOPMENT_FOUNDATION.md
- Impact: Category service now has a validated Prisma entry point and a defined target database for later schema implementation.
- Notes: No API contract deviation.

## 2026-03-28T09:05:00+05:30

- Scope: category-service
- Type: feat
- Summary: Implemented category CRUD, existence checks, active-name uniqueness enforcement, Prisma persistence, and category service tests for Phase 6.
- Files: apps/category-service/src/category-service.module.ts, apps/category-service/src/bootstrap.ts, apps/category-service/src/main.ts, apps/category-service/src/categories/category.controller.ts, apps/category-service/src/categories/category.service.ts, apps/category-service/src/categories/category.service.spec.ts, apps/category-service/src/categories/category.repository.ts, apps/category-service/src/categories/in-memory-category.repository.ts, apps/category-service/src/categories/prisma-category.repository.ts, apps/category-service/src/categories/dto/create-category.dto.ts, apps/category-service/src/categories/dto/update-category.dto.ts, apps/category-service/src/categories/dto/list-categories.query.dto.ts, apps/category-service/src/categories/enums/category-status.enum.ts, apps/category-service/src/categories/interfaces/category.interface.ts, apps/category-service/src/platform/roles/category-role.enum.ts, apps/category-service/src/platform/roles/roles.decorator.ts, apps/category-service/src/platform/roles/roles.guard.ts, apps/category-service/src/prisma/prisma.service.ts, apps/category-service/src/common/category-response.helpers.ts, apps/category-service/src/common/validation-exception.factory.ts, apps/category-service/test/app.e2e-spec.ts, apps/category-service/prisma/schema.prisma, package.json, .env.example, README.md
- Impact: Category service is now a runnable business service with protected writes, public reads, soft-delete lifecycle, and existence checks for future book validation flows.
- Notes: Active category name uniqueness is enforced in the service layer so deactivated category names can be reused later if needed.
## 2026-03-28T11:15:00+05:30

- Scope: category-service
- Type: feature
- Summary: Enabled Swagger documentation for category routes, documented request DTOs, and added smoke tests for `/docs` and `/docs-json`.
- Files: apps/shared/configure-swagger.ts, apps/category-service/src/bootstrap.ts, apps/category-service/src/categories/category.controller.ts, apps/category-service/src/categories/dto/create-category.dto.ts, apps/category-service/src/categories/dto/list-categories.query.dto.ts, apps/category-service/src/categories/dto/update-category.dto.ts, apps/category-service/test/app.e2e-spec.ts, README.md, package.json, package-lock.json
- Impact: Category Service now exposes a usable OpenAPI surface for CRUD and existence workflows.
- Notes: No API contract deviation.

## 2026-03-28T20:40:00+05:30

- Scope: category-service
- Type: chore
- Summary: Added container build support and Docker Compose runtime wiring for Category Service, including automatic schema preparation on startup.
- Files: docker-compose.yml, docker/node-service.Dockerfile, package.json, README.md, docs/agents/MICROSERVICES_EVOLUTION_PLAN.md
- Impact: Category Service can now run as an isolated container and participate in the Compose-based local runtime.
- Notes: No API contract deviation.

## 2026-03-28T21:05:00+05:30

- Scope: category-service
- Type: chore
- Summary: Added an app-owned Dockerfile and independent image build contract for Category Service.
- Files: apps/category-service/Dockerfile, docker-compose.yml, package.json, docs/deployment/INDEPENDENT_SERVICE_DEPLOYMENT.md
- Impact: Category Service can now be built and deployed with an explicit service-owned container definition.
- Notes: No API contract deviation.

## 2026-03-28T21:30:00+05:30

- Scope: category-service
- Type: chore
- Summary: Added file-backed runtime configuration support for Category Service database URL inputs.
- Files: apps/shared/config/runtime-config.util.ts, apps/shared/config/runtime-config.util.spec.ts, apps/category-service/src/main.ts, apps/category-service/src/prisma/prisma.service.ts, docker-compose.yml, .env.example, .env.compose.example, docs/deployment/CONFIGURATION_AND_SECRETS.md
- Impact: Category Service can now resolve its database configuration from mounted files as well as direct environment variables.
- Notes: No API contract deviation.

## 2026-03-28T21:55:00+05:30

- Scope: category-service
- Type: feature
- Summary: Added shared request metrics collection and a Prometheus-style `/metrics` endpoint to Category Service.
- Files: apps/shared/observability/metrics.service.ts, apps/shared/observability/metrics.interceptor.ts, apps/category-service/src/category-service.module.ts, apps/category-service/src/bootstrap.ts, apps/category-service/src/metrics/metrics.controller.ts, README.md, docs/deployment/OBSERVABILITY.md
- Impact: Category Service now exposes process-local request metrics for operational visibility.
- Notes: No API contract deviation.
