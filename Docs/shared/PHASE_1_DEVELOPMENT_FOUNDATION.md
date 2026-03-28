# Phase 1 Development Foundation

## PostgreSQL Provisioning Plan

- One Dockerized PostgreSQL container provides the shared local database runtime.
- Each service owns a separate logical database: `auth_db`, `member_db`, `category_db`, `book_db`, `borrow_db`, and `fine_db`.
- Database initialization runs through the mounted script in `docker/postgres/init/01-create-databases.sh`.

## Prisma Foundation

- Each database-owning service has its own `prisma/schema.prisma`.
- Every schema uses `env("DATABASE_URL")` so runtime configuration stays outside code.
- Prisma validation is part of the baseline development checks for all six domain services.

## Request Correlation Plan

- The API Gateway is responsible for assigning or propagating `x-correlation-id`.
- Downstream service-to-service HTTP calls must forward the same correlation ID.
- Logs should include correlation IDs so request flow can be traced across services.

## Startup Contract

- Start infrastructure first with Docker Compose.
- Start the domain services and API Gateway as separate processes during local development.
- Use the API Gateway as the primary external entry point once services are running.
