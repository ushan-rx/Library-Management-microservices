# Member Service Changelog

## 2026-03-27T18:30:00+05:30

- Scope: member-service
- Type: chore
- Summary: Initialized Phase 0 changelog and aligned member service bootstrap defaults with the documented service port.
- Files: apps/member-service/src/main.ts, apps/member-service/test/app.e2e-spec.ts
- Impact: Member service scaffold now has the correct default port and clean baseline lint coverage.
- Notes: No API contract deviation.

## 2026-03-27T19:00:00+05:30

- Scope: member-service
- Type: chore
- Summary: Added Prisma foundation scaffolding and documented the member service database and environment contract for Phase 1.
- Files: apps/member-service/prisma/schema.prisma, package.json, package-lock.json, .env.example, docs/shared/PHASE_1_DEVELOPMENT_FOUNDATION.md
- Impact: Member service now has a validated Prisma entry point and a defined target database for later schema implementation.
- Notes: No API contract deviation.

## 2026-03-27T21:40:00+05:30

- Scope: member-service
- Type: feat
- Summary: Implemented member CRUD, eligibility checks, role guards, Prisma persistence, and member service tests for Phase 5.
- Files: apps/member-service/src/member-service.module.ts, apps/member-service/src/bootstrap.ts, apps/member-service/src/main.ts, apps/member-service/src/members/member.controller.ts, apps/member-service/src/members/member.service.ts, apps/member-service/src/members/member.service.spec.ts, apps/member-service/src/members/member.repository.ts, apps/member-service/src/members/in-memory-member.repository.ts, apps/member-service/src/members/prisma-member.repository.ts, apps/member-service/src/platform/roles/member-role.enum.ts, apps/member-service/src/platform/roles/roles.decorator.ts, apps/member-service/src/platform/roles/roles.guard.ts, apps/member-service/src/prisma/prisma.service.ts, apps/member-service/test/app.e2e-spec.ts, apps/member-service/prisma/schema.prisma, package.json, .env.example, README.md
- Impact: Member service is now a runnable business service with validated CRUD behavior, eligibility support for borrow flows, and service-level role protection.
- Notes: Eligibility endpoint is left unguarded to support future internal borrow-service checks without premature gateway forwarding changes.
## 2026-03-28T11:15:00+05:30

- Scope: member-service
- Type: feature
- Summary: Enabled Swagger documentation for member routes, documented request DTOs, and added smoke tests for `/docs` and `/docs-json`.
- Files: apps/shared/configure-swagger.ts, apps/member-service/src/bootstrap.ts, apps/member-service/src/members/member.controller.ts, apps/member-service/src/members/dto/create-member.dto.ts, apps/member-service/src/members/dto/list-members.query.dto.ts, apps/member-service/src/members/dto/update-member.dto.ts, apps/member-service/test/app.e2e-spec.ts, README.md, package.json, package-lock.json
- Impact: Member Service now exposes a usable OpenAPI surface for CRUD and eligibility workflows.
- Notes: No API contract deviation.

## 2026-03-28T20:40:00+05:30

- Scope: member-service
- Type: chore
- Summary: Added container build support and Docker Compose runtime wiring for Member Service, including automatic schema preparation on container startup.
- Files: docker-compose.yml, docker/node-service.Dockerfile, package.json, README.md, docs/agents/MICROSERVICES_EVOLUTION_PLAN.md
- Impact: Member Service can now run independently as a container in the local multi-service stack.
- Notes: No API contract deviation.

## 2026-03-28T21:05:00+05:30

- Scope: member-service
- Type: chore
- Summary: Added an app-owned Dockerfile and independent image build contract for Member Service.
- Files: apps/member-service/Dockerfile, docker-compose.yml, package.json, docs/deployment/INDEPENDENT_SERVICE_DEPLOYMENT.md
- Impact: Member Service can now be built and deployed with an explicit service-owned container definition.
- Notes: No API contract deviation.

## 2026-03-28T21:30:00+05:30

- Scope: member-service
- Type: chore
- Summary: Added file-backed runtime configuration support for Member Service database URL inputs.
- Files: apps/shared/config/runtime-config.util.ts, apps/shared/config/runtime-config.util.spec.ts, apps/member-service/src/main.ts, apps/member-service/src/prisma/prisma.service.ts, docker-compose.yml, .env.example, .env.compose.example, docs/deployment/CONFIGURATION_AND_SECRETS.md
- Impact: Member Service can now resolve its database configuration from mounted files as well as direct environment variables.
- Notes: No API contract deviation.
