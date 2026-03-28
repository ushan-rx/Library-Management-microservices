# Book Service Changelog

## 2026-03-27T18:30:00+05:30

- Scope: book-service
- Type: chore
- Summary: Initialized Phase 0 changelog and aligned book service bootstrap defaults with the documented service port.
- Files: apps/book-service/src/main.ts, apps/book-service/test/app.e2e-spec.ts
- Impact: Book service scaffold now has the correct default port and clean baseline lint coverage.
- Notes: No API contract deviation.

## 2026-03-27T19:00:00+05:30

- Scope: book-service
- Type: chore
- Summary: Added Prisma foundation scaffolding and documented the book service database and environment contract for Phase 1.
- Files: apps/book-service/prisma/schema.prisma, package.json, package-lock.json, .env.example, docs/shared/PHASE_1_DEVELOPMENT_FOUNDATION.md
- Impact: Book service now has a validated Prisma entry point and a defined target database for later schema implementation.
- Notes: No API contract deviation.

## 2026-03-28T09:45:00+05:30

- Scope: book-service
- Type: feat
- Summary: Implemented book CRUD, availability checks, category validation, atomic inventory updates, and inventory adjustment logging for Phase 7.
- Files: apps/book-service/src/book-service.module.ts, apps/book-service/src/bootstrap.ts, apps/book-service/src/main.ts, apps/book-service/src/books/book.controller.ts, apps/book-service/src/books/book.service.ts, apps/book-service/src/books/book.service.spec.ts, apps/book-service/src/books/book.repository.ts, apps/book-service/src/books/in-memory-book.repository.ts, apps/book-service/src/books/prisma-book.repository.ts, apps/book-service/src/books/dto/create-book.dto.ts, apps/book-service/src/books/dto/update-book.dto.ts, apps/book-service/src/books/dto/list-books.query.dto.ts, apps/book-service/src/books/dto/inventory-adjust.dto.ts, apps/book-service/src/books/enums/book-status.enum.ts, apps/book-service/src/books/enums/inventory-adjustment-type.enum.ts, apps/book-service/src/books/interfaces/book.interface.ts, apps/book-service/src/books/interfaces/book-inventory-adjustment.interface.ts, apps/book-service/src/integrations/category.client.ts, apps/book-service/src/platform/roles/book-role.enum.ts, apps/book-service/src/platform/roles/roles.decorator.ts, apps/book-service/src/platform/roles/roles.guard.ts, apps/book-service/src/prisma/prisma.service.ts, apps/book-service/src/common/book-response.helpers.ts, apps/book-service/src/common/validation-exception.factory.ts, apps/book-service/test/app.e2e-spec.ts, apps/book-service/prisma/schema.prisma, package.json, .env.example, README.md
- Impact: Book service is now a runnable business service with protected writes, public reads, validated copy-count invariants, and adjustment history for borrow and return flows.
- Notes: Category validation is enabled by default through the Category Service existence endpoint and can be disabled in tests with `BOOK_VALIDATE_CATEGORY_ON_WRITE=false`.
## 2026-03-28T11:15:00+05:30

- Scope: book-service
- Type: feature
- Summary: Enabled Swagger documentation for book routes, documented request DTOs, and added smoke tests for `/docs` and `/docs-json`.
- Files: apps/shared/configure-swagger.ts, apps/book-service/src/bootstrap.ts, apps/book-service/src/books/book.controller.ts, apps/book-service/src/books/dto/create-book.dto.ts, apps/book-service/src/books/dto/list-books.query.dto.ts, apps/book-service/src/books/dto/update-book.dto.ts, apps/book-service/src/books/dto/inventory-adjust.dto.ts, apps/book-service/test/app.e2e-spec.ts, README.md, package.json, package-lock.json
- Impact: Book Service now exposes a usable OpenAPI surface for catalog, availability, and inventory workflows.
- Notes: No API contract deviation.
## 2026-03-28T19:20:00+05:30

- Scope: book-service
- Type: refactor
- Summary: Added structured downstream logging and correlation ID propagation for category validation requests.
- Files: apps/book-service/src/integrations/category.client.ts, apps/book-service/src/integrations/downstream-request.util.ts, README.md
- Impact: Category validation failures and timings are now easier to trace from book-service logs without changing request or response contracts.
- Notes: No API contract deviation.

## 2026-03-28T20:40:00+05:30

- Scope: book-service
- Type: chore
- Summary: Added container build support and Docker Compose runtime wiring for Book Service, including internal routing to Category Service and automatic schema preparation.
- Files: docker-compose.yml, docker/node-service.Dockerfile, package.json, README.md, docs/agents/MICROSERVICES_EVOLUTION_PLAN.md
- Impact: Book Service can now run as an isolated container with container-network dependencies resolved through service names.
- Notes: No API contract deviation.

## 2026-03-28T21:05:00+05:30

- Scope: book-service
- Type: chore
- Summary: Added an app-owned Dockerfile and independent image build contract for Book Service.
- Files: apps/book-service/Dockerfile, docker-compose.yml, package.json, docs/deployment/INDEPENDENT_SERVICE_DEPLOYMENT.md
- Impact: Book Service can now be built and deployed with an explicit service-owned container definition.
- Notes: No API contract deviation.
