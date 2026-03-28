# Independent Service Deployment Contract

## Purpose

This document defines the runtime contract for deploying each backend service independently rather than only as part of the full local stack.

Each service now has its own Dockerfile under `apps/<service>/Dockerfile`.

## Build Commands

Build individual service images from the repository root:

```bash
npm run docker:build:api-gateway
npm run docker:build:auth-service
npm run docker:build:member-service
npm run docker:build:category-service
npm run docker:build:book-service
npm run docker:build:borrow-service
npm run docker:build:fine-payment-service
```

## Runtime Contract by Service

### API Gateway

- Image entrypoint: `apps/api-gateway/Dockerfile`
- Port: `3000`
- Health route: `GET /health`
- Required upstream env:
  - `AUTH_SERVICE_BASE_URL`
  - `MEMBER_SERVICE_BASE_URL`
  - `CATEGORY_SERVICE_BASE_URL`
  - `BOOK_SERVICE_BASE_URL`
  - `BORROW_SERVICE_BASE_URL`
  - `FINE_PAYMENT_SERVICE_BASE_URL`
- Required auth env:
  - `JWT_SECRET`

### Auth Service

- Image entrypoint: `apps/auth-service/Dockerfile`
- Port: `3001`
- Health route: `GET /auth/health`
- Required database env:
  - `AUTH_DATABASE_URL`
  - `DATABASE_URL`
- Required auth env:
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`

### Member Service

- Image entrypoint: `apps/member-service/Dockerfile`
- Port: `3002`
- Health route: `GET /members/health`
- Required env:
  - `MEMBER_DATABASE_URL`
  - `DATABASE_URL`
  - `MEMBER_STORAGE_DRIVER`

### Category Service

- Image entrypoint: `apps/category-service/Dockerfile`
- Port: `3004`
- Health route: `GET /categories/health`
- Required env:
  - `CATEGORY_DATABASE_URL`
  - `DATABASE_URL`
  - `CATEGORY_STORAGE_DRIVER`

### Book Service

- Image entrypoint: `apps/book-service/Dockerfile`
- Port: `3003`
- Health route: `GET /books/health`
- Required env:
  - `BOOK_DATABASE_URL`
  - `DATABASE_URL`
  - `BOOK_STORAGE_DRIVER`
  - `CATEGORY_SERVICE_BASE_URL`
- Optional env:
  - `BOOK_VALIDATE_CATEGORY_ON_WRITE`

### Borrow Service

- Image entrypoint: `apps/borrow-service/Dockerfile`
- Port: `3005`
- Health route: `GET /borrows/health`
- Required env:
  - `BORROW_DATABASE_URL`
  - `DATABASE_URL`
  - `BORROW_STORAGE_DRIVER`
  - `MEMBER_SERVICE_BASE_URL`
  - `BOOK_SERVICE_BASE_URL`
  - `FINE_PAYMENT_SERVICE_BASE_URL`
- Optional env:
  - `BORROW_FINE_AMOUNT_PER_DAY`

### Fine Payment Service

- Image entrypoint: `apps/fine-payment-service/Dockerfile`
- Port: `3006`
- Health route: `GET /fines/health`
- Required env:
  - `FINE_DATABASE_URL`
  - `DATABASE_URL`
  - `FINE_STORAGE_DRIVER`

## Deployment Rules

- Each service image must remain runnable on its own with only its declared runtime dependencies.
- Service-to-service URLs must be environment-driven and must not assume `localhost` in container deployments.
- Database-owning services prepare their schema at container startup using Prisma.
- The API Gateway is the public entry point, but downstream services remain independently bootable for deployment, testing, and health checks.

## Local Deployment Modes

- Full stack: use `docker compose up --build -d`
- Single service image: build with the service-specific `npm run docker:build:*` command, then provide the required environment variables at `docker run` time
