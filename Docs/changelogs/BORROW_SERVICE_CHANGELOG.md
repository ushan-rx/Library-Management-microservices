# Borrow Service Changelog

## 2026-03-27T18:30:00+05:30

- Scope: borrow-service
- Type: chore
- Summary: Initialized Phase 0 changelog and aligned borrow service bootstrap defaults with the documented service port.
- Files: apps/borrow-service/src/main.ts, apps/borrow-service/test/app.e2e-spec.ts
- Impact: Borrow service scaffold now has the correct default port and clean baseline lint coverage.
- Notes: No API contract deviation.

## 2026-03-27T19:00:00+05:30

- Scope: borrow-service
- Type: chore
- Summary: Added Prisma foundation scaffolding and documented the borrow service database and environment contract for Phase 1.
- Files: apps/borrow-service/prisma/schema.prisma, package.json, package-lock.json, .env.example, docs/shared/PHASE_1_DEVELOPMENT_FOUNDATION.md
- Impact: Borrow service now has a validated Prisma entry point and a defined target database for later schema implementation.
- Notes: No API contract deviation.

## 2026-03-28T10:35:00+05:30

- Scope: borrow-service
- Type: feat
- Summary: Implemented borrow orchestration with downstream member, book, and fine clients plus return and overdue handling for Phase 8.
- Files: apps/borrow-service/src/borrow-service.module.ts, apps/borrow-service/src/bootstrap.ts, apps/borrow-service/src/main.ts, apps/borrow-service/src/borrows/borrow.controller.ts, apps/borrow-service/src/borrows/borrow.service.ts, apps/borrow-service/src/borrows/borrow.service.spec.ts, apps/borrow-service/src/borrows/borrow.repository.ts, apps/borrow-service/src/borrows/in-memory-borrow.repository.ts, apps/borrow-service/src/borrows/prisma-borrow.repository.ts, apps/borrow-service/src/borrows/dto/create-borrow.dto.ts, apps/borrow-service/src/borrows/dto/return-book.dto.ts, apps/borrow-service/src/borrows/dto/update-borrow.dto.ts, apps/borrow-service/src/borrows/dto/list-borrows.query.dto.ts, apps/borrow-service/src/borrows/enums/borrow-status.enum.ts, apps/borrow-service/src/borrows/interfaces/borrow.interface.ts, apps/borrow-service/src/integrations/member.client.ts, apps/borrow-service/src/integrations/book.client.ts, apps/borrow-service/src/integrations/fine.client.ts, apps/borrow-service/src/platform/roles/borrow-role.enum.ts, apps/borrow-service/src/platform/roles/roles.decorator.ts, apps/borrow-service/src/platform/roles/roles.guard.ts, apps/borrow-service/src/prisma/prisma.service.ts, apps/borrow-service/src/common/borrow-response.helpers.ts, apps/borrow-service/src/common/validation-exception.factory.ts, apps/borrow-service/test/app.e2e-spec.ts, apps/borrow-service/prisma/schema.prisma, package.json, .env.example, README.md
- Impact: Borrow service is now a runnable coordinating service that validates member eligibility, checks book availability, updates inventory, processes returns, and triggers overdue fine creation.
- Notes: Borrow fine amount is configurable through `BORROW_FINE_AMOUNT_PER_DAY` and defaults to `100`.
## 2026-03-28T11:15:00+05:30

- Scope: borrow-service
- Type: feature
- Summary: Enabled Swagger documentation for borrow routes, documented request DTOs, and added smoke tests for `/docs` and `/docs-json`.
- Files: apps/shared/configure-swagger.ts, apps/borrow-service/src/bootstrap.ts, apps/borrow-service/src/borrows/borrow.controller.ts, apps/borrow-service/src/borrows/dto/create-borrow.dto.ts, apps/borrow-service/src/borrows/dto/list-borrows.query.dto.ts, apps/borrow-service/src/borrows/dto/return-book.dto.ts, apps/borrow-service/src/borrows/dto/update-borrow.dto.ts, apps/borrow-service/test/app.e2e-spec.ts, README.md, package.json, package-lock.json
- Impact: Borrow Service now exposes a usable OpenAPI surface for borrow creation, return, and overdue workflows.
- Notes: No API contract deviation.
## 2026-03-28T19:20:00+05:30

- Scope: borrow-service
- Type: refactor
- Summary: Added structured downstream logging and correlation ID propagation for member, book, and fine service calls.
- Files: apps/borrow-service/src/integrations/member.client.ts, apps/borrow-service/src/integrations/book.client.ts, apps/borrow-service/src/integrations/fine.client.ts, apps/borrow-service/src/integrations/downstream-request.util.ts, README.md
- Impact: Borrow orchestration now produces traceable downstream call logs with durations, target services, and correlation IDs for both success and failure paths.
- Notes: No API contract deviation.

## 2026-03-28T20:40:00+05:30

- Scope: borrow-service
- Type: chore
- Summary: Added container build support and Docker Compose runtime wiring for Borrow Service, including service-name based downstream URLs and automatic schema preparation.
- Files: docker-compose.yml, docker/node-service.Dockerfile, package.json, README.md, docs/agents/MICROSERVICES_EVOLUTION_PLAN.md
- Impact: Borrow Service can now run as an isolated container in a full local microservice runtime.
- Notes: No API contract deviation.

## 2026-03-28T21:05:00+05:30

- Scope: borrow-service
- Type: chore
- Summary: Added an app-owned Dockerfile and independent image build contract for Borrow Service.
- Files: apps/borrow-service/Dockerfile, docker-compose.yml, package.json, docs/deployment/INDEPENDENT_SERVICE_DEPLOYMENT.md
- Impact: Borrow Service can now be built and deployed with an explicit service-owned container definition.
- Notes: No API contract deviation.

## 2026-03-28T21:30:00+05:30

- Scope: borrow-service
- Type: chore
- Summary: Added file-backed runtime configuration support for Borrow Service database URL inputs.
- Files: apps/shared/config/runtime-config.util.ts, apps/shared/config/runtime-config.util.spec.ts, apps/borrow-service/src/main.ts, apps/borrow-service/src/prisma/prisma.service.ts, docker-compose.yml, .env.example, .env.compose.example, docs/deployment/CONFIGURATION_AND_SECRETS.md
- Impact: Borrow Service can now resolve its database configuration from mounted files as well as direct environment variables.
- Notes: No API contract deviation.
