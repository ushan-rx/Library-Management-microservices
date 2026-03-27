# Phase 1 Development Foundation

## Purpose

This document defines the shared infrastructure and development conventions established in Phase 1.

## Local Run Model

- run PostgreSQL through Docker Compose
- run Nest application services locally during development
- use one PostgreSQL container with six logical databases
- keep one database per service for data ownership separation

## PostgreSQL Provisioning Plan

Docker resource:

- service name: `postgres-core`
- image: `postgres:16-alpine`
- exposed port: `5432`

Logical databases created on startup:

- `auth_db`
- `member_db`
- `category_db`
- `book_db`
- `borrow_db`
- `fine_db`

Initialization asset:

- `docker/postgres/init/01-create-databases.sh`

## Environment Contract

Shared variables:

- `NODE_ENV`
- `LOG_LEVEL`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_SUPER_DB`

Service port variables:

- `API_GATEWAY_PORT=3000`
- `AUTH_SERVICE_PORT=3001`
- `MEMBER_SERVICE_PORT=3002`
- `BOOK_SERVICE_PORT=3003`
- `CATEGORY_SERVICE_PORT=3004`
- `BORROW_SERVICE_PORT=3005`
- `FINE_PAYMENT_SERVICE_PORT=3006`

Service database targets:

- auth service -> `auth_db`
- member service -> `member_db`
- category service -> `category_db`
- book service -> `book_db`
- borrow service -> `borrow_db`
- fine payment service -> `fine_db`

## Prisma Foundation

Each service now has a Prisma schema file at:

- `apps/auth-service/prisma/schema.prisma`
- `apps/member-service/prisma/schema.prisma`
- `apps/category-service/prisma/schema.prisma`
- `apps/book-service/prisma/schema.prisma`
- `apps/borrow-service/prisma/schema.prisma`
- `apps/fine-payment-service/prisma/schema.prisma`

Phase 1 intentionally keeps these schemas at datasource and generator level only.
Service-specific models will be added in the relevant implementation phases.

## Logging Conventions

All services and the gateway should use structured logs with these fields where applicable:

- timestamp
- level
- service
- correlationId
- method
- route
- statusCode
- durationMs
- actorId
- downstreamService

Do not log passwords, password hashes, JWTs, or secret values.

## Request Correlation Plan

- client requests may provide `x-correlation-id`
- the API Gateway should propagate the incoming correlation id when present
- the API Gateway should generate a correlation id when missing
- downstream services should include the correlation id in request logs and outbound call logs

## Validation and Smoke Checks

Phase 1 verification should cover:

- Docker Compose config validity
- PostgreSQL container startup
- database existence smoke check for all six logical databases
- Prisma schema validation for each service
