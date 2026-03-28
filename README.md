# Library System Microservices

Library Management System backend built as a NestJS monorepo with an API Gateway and six domain services.

The system supports:

- authentication with JWT
- member management
- category management
- book catalog and inventory management
- borrow and return workflows
- overdue fine creation and payment recording
- gateway-based end-to-end request flow
- Swagger documentation for the gateway and every service

## Architecture

The backend is split into these applications:

- `api-gateway`
- `auth-service`
- `member-service`
- `category-service`
- `book-service`
- `borrow-service`
- `fine-payment-service`

Each business service owns its own persistence model and Prisma schema. Client traffic is intended to go through the API Gateway, while approved service-to-service communication happens directly over HTTP where required.

## Tech Stack

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Docker Compose
- Jest
- Swagger / OpenAPI

## Services and Default Ports

| Service | Port | Purpose |
|---|---:|---|
| API Gateway | `3000` | Public entry point, auth enforcement, request forwarding |
| Auth Service | `3001` | Register, login, token validation, profile |
| Member Service | `3002` | Member CRUD and borrow eligibility |
| Book Service | `3003` | Book catalog, availability, inventory updates |
| Category Service | `3004` | Category CRUD and existence checks |
| Borrow Service | `3005` | Borrow creation, returns, overdue handling |
| Fine Payment Service | `3006` | Fine records and payment workflows |

## Repository Layout

High-level structure:

```text
apps/
  api-gateway/
  auth-service/
  member-service/
  category-service/
  book-service/
  borrow-service/
  fine-payment-service/
  shared/
docker/
docs/
test/
```

Additional structure details are in [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## Documentation

Canonical specifications and delivery docs are under `docs/`.

Important references:

- [docs/specs/README_SYSTEM.md](./docs/specs/README_SYSTEM.md)
- [docs/specs/API_CONTRACTS.md](./docs/specs/API_CONTRACTS.md)
- [docs/specs/DATA_SCHEMAS.md](./docs/specs/DATA_SCHEMAS.md)
- [docs/specs/API_GATEWAY.md](./docs/specs/API_GATEWAY.md)
- [docs/specs/AUTH_ARCHITECTURE.md](./docs/specs/AUTH_ARCHITECTURE.md)
- [docs/agents/AGENT_GUIDE.md](./docs/agents/AGENT_GUIDE.md)
- [docs/agents/PHASED_DEVELOPMENT_PLAN.md](./docs/agents/PHASED_DEVELOPMENT_PLAN.md)
- [docs/agents/PHASE_14_RELEASE_CANDIDATE.md](./docs/agents/PHASE_14_RELEASE_CANDIDATE.md)

## Prerequisites

- Node.js
- npm
- Docker Desktop or Docker Engine with Compose support

## Environment Setup

Copy values from `.env.example` into your local environment as needed.

Main environment file:

- [`.env.example`](./.env.example)

The project uses:

- one Dockerized PostgreSQL container
- one logical database per service
- shared JWT secret between Auth Service and API Gateway

## Installation

```bash
npm install
```

## Start Infrastructure

Start PostgreSQL:

```bash
npm run docker:up
```

View PostgreSQL logs:

```bash
npm run docker:logs:postgres
```

Stop PostgreSQL:

```bash
npm run docker:down
```

## Run the System Locally

Start each service in a separate terminal:

```bash
npm run start:auth-service
npm run start:member-service
npm run start:category-service
npm run start:book-service
npm run start:borrow-service
npm run start:fine-payment-service
npm run start
```

The final `npm run start` command starts the API Gateway.

## Main Entry Point

Once all services are running, use the gateway as the main backend entry point:

- `http://localhost:3000`

## Swagger Documentation

Swagger UI:

- Gateway: `http://localhost:3000/docs`
- Auth Service: `http://localhost:3001/docs`
- Member Service: `http://localhost:3002/docs`
- Book Service: `http://localhost:3003/docs`
- Category Service: `http://localhost:3004/docs`
- Borrow Service: `http://localhost:3005/docs`
- Fine Payment Service: `http://localhost:3006/docs`

OpenAPI JSON:

- Gateway: `http://localhost:3000/docs-json`
- Auth Service: `http://localhost:3001/docs-json`
- Member Service: `http://localhost:3002/docs-json`
- Book Service: `http://localhost:3003/docs-json`
- Category Service: `http://localhost:3004/docs-json`
- Borrow Service: `http://localhost:3005/docs-json`
- Fine Payment Service: `http://localhost:3006/docs-json`

## Key Gateway Routes

Public routes:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`

Protected route groups:

- `/auth/profile`
- `/members`
- `/categories`
- `/books`
- `/borrows`
- `/fines`

## Example End-to-End Flow

Typical librarian workflow through the gateway:

1. Register or log in through `/auth/register` or `/auth/login`
2. Create a category through `/categories`
3. Create a book through `/books`
4. Create a member through `/members`
5. Create a borrow through `/borrows`
6. Return the borrow through `/borrows/:borrowId/return`
7. Check the generated fine through `/fines/borrow/:borrowId`
8. Record payment through `/fines/:fineId/payments`

## Testing

Run the main checks:

```bash
npm run lint
npm run test -- --runInBand
npm run test:e2e
npm run build
```

Other useful commands:

```bash
npm run prisma:validate:auth-service
npm run prisma:validate:member-service
npm run prisma:validate:category-service
npm run prisma:validate:book-service
npm run prisma:validate:borrow-service
npm run prisma:validate:fine-payment-service
```

Per-service build commands:

```bash
npm run build:api-gateway
npm run build:auth-service
npm run build:member-service
npm run build:category-service
npm run build:book-service
npm run build:borrow-service
npm run build:fine-payment-service
```

## Observability

Current observability support includes:

- gateway request logs with correlation ID
- actor context in gateway logs when authenticated
- downstream route-group context in gateway logs
- correlation ID propagation in downstream HTTP calls from book-service and borrow-service
- structured downstream service-call logs for validation, inventory, and fine operations

## Changelogs

Service and gateway changelogs are in `docs/changelogs/`.

- [docs/changelogs/API_GATEWAY_CHANGELOG.md](./docs/changelogs/API_GATEWAY_CHANGELOG.md)
- [docs/changelogs/AUTH_SERVICE_CHANGELOG.md](./docs/changelogs/AUTH_SERVICE_CHANGELOG.md)
- [docs/changelogs/MEMBER_SERVICE_CHANGELOG.md](./docs/changelogs/MEMBER_SERVICE_CHANGELOG.md)
- [docs/changelogs/CATEGORY_SERVICE_CHANGELOG.md](./docs/changelogs/CATEGORY_SERVICE_CHANGELOG.md)
- [docs/changelogs/BOOK_SERVICE_CHANGELOG.md](./docs/changelogs/BOOK_SERVICE_CHANGELOG.md)
- [docs/changelogs/BORROW_SERVICE_CHANGELOG.md](./docs/changelogs/BORROW_SERVICE_CHANGELOG.md)
- [docs/changelogs/FINE_PAYMENT_SERVICE_CHANGELOG.md](./docs/changelogs/FINE_PAYMENT_SERVICE_CHANGELOG.md)

## Current Status

The repository is in release-candidate shape:

- all planned implementation phases are complete
- the backend is runnable end-to-end through the API Gateway
- the critical business flow is covered by gateway-based e2e tests
- service and gateway Swagger docs are available

## Notes

- In this sandboxed environment, `npm run build` completes successfully and may then print `Error: spawn EPERM`. The compile step itself still succeeds.
- The gateway is the intended public entry point for normal usage.
