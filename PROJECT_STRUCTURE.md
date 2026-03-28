# Project Structure

This document captures the current high-level structure of the `library-system-microservices` repository.

```text
.
|-- apps
|   |-- api-gateway
|   |   |-- src
|   |   |   |-- config
|   |   |   |-- health
|   |   |   |-- platform
|   |   |   |-- routing
|   |   |   |-- services
|   |   |   |-- api-gateway.module.ts
|   |   |   |-- bootstrap.ts
|   |   |   +-- main.ts
|   |   +-- test
|   |       |-- app.e2e-spec.ts
|   |       |-- gateway-business-flows.e2e-spec.ts
|   |       +-- jest-e2e.json
|   |-- auth-service
|   |   |-- prisma
|   |   |   +-- schema.prisma
|   |   |-- src
|   |   |   |-- auth
|   |   |   |-- common
|   |   |   |-- prisma
|   |   |   |-- users
|   |   |   |-- auth-service.module.ts
|   |   |   |-- bootstrap.ts
|   |   |   +-- main.ts
|   |   +-- test
|   |       +-- app.e2e-spec.ts
|   |-- member-service
|   |   |-- prisma
|   |   |   +-- schema.prisma
|   |   |-- src
|   |   |   |-- common
|   |   |   |-- members
|   |   |   |-- platform
|   |   |   |-- prisma
|   |   |   |-- bootstrap.ts
|   |   |   |-- main.ts
|   |   |   +-- member-service.module.ts
|   |   +-- test
|   |       +-- app.e2e-spec.ts
|   |-- category-service
|   |   |-- prisma
|   |   |   +-- schema.prisma
|   |   |-- src
|   |   |   |-- categories
|   |   |   |-- common
|   |   |   |-- platform
|   |   |   |-- prisma
|   |   |   |-- bootstrap.ts
|   |   |   |-- category-service.module.ts
|   |   |   +-- main.ts
|   |   +-- test
|   |       +-- app.e2e-spec.ts
|   |-- book-service
|   |   |-- prisma
|   |   |   +-- schema.prisma
|   |   |-- src
|   |   |   |-- books
|   |   |   |-- common
|   |   |   |-- integrations
|   |   |   |-- platform
|   |   |   |-- prisma
|   |   |   |-- book-service.module.ts
|   |   |   |-- bootstrap.ts
|   |   |   +-- main.ts
|   |   +-- test
|   |       +-- app.e2e-spec.ts
|   |-- borrow-service
|   |   |-- prisma
|   |   |   +-- schema.prisma
|   |   |-- src
|   |   |   |-- borrows
|   |   |   |-- common
|   |   |   |-- integrations
|   |   |   |-- platform
|   |   |   |-- prisma
|   |   |   |-- bootstrap.ts
|   |   |   |-- borrow-service.module.ts
|   |   |   +-- main.ts
|   |   +-- test
|   |       +-- app.e2e-spec.ts
|   |-- fine-payment-service
|   |   |-- prisma
|   |   |   +-- schema.prisma
|   |   |-- src
|   |   |   |-- fines
|   |   |   |-- common
|   |   |   |-- platform
|   |   |   |-- prisma
|   |   |   |-- bootstrap.ts
|   |   |   |-- fine-payment-service.module.ts
|   |   |   +-- main.ts
|   |   +-- test
|   |       +-- app.e2e-spec.ts
|   +-- shared
|       +-- configure-swagger.ts
|-- docker
|   +-- postgres
|       +-- init
|           +-- 01-create-databases.sh
|-- docs
|   |-- agents
|   |-- changelogs
|   |-- services
|   |-- shared
|   +-- specs
|-- test
|   +-- phase-1-foundation.spec.ts
|-- .env.example
|-- docker-compose.yml
|-- PROJECT_STRUCTURE.md
|-- README.md
|-- package.json
|-- package-lock.json
```

## Notes

- `node_modules` and `dist` are intentionally excluded from this structure file.
- Each business service owns its own Prisma schema and persistence layer.
- The API Gateway is the public entry point and the gateway e2e suite exercises full business flows through real service instances.
- Canonical project specifications and delivery rules live under `docs/`.
