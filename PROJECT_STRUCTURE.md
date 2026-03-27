# Project Structure

This document captures the current folder structure of the `library-system-microservices` codebase.

```text
.
|-- apps
|   |-- api-gateway
|   |   |-- src
|   |   |   |-- api-gateway.controller.spec.ts
|   |   |   |-- api-gateway.controller.ts
|   |   |   |-- api-gateway.module.ts
|   |   |   |-- api-gateway.service.ts
|   |   |   +-- main.ts
|   |   |-- test
|   |   |   |-- app.e2e-spec.ts
|   |   |   +-- jest-e2e.json
|   |   +-- tsconfig.app.json
|   |-- auth-service
|   |   |-- src
|   |   |   |-- auth-service.controller.spec.ts
|   |   |   |-- auth-service.controller.ts
|   |   |   |-- auth-service.module.ts
|   |   |   |-- auth-service.service.ts
|   |   |   +-- main.ts
|   |   |-- test
|   |   |   |-- app.e2e-spec.ts
|   |   |   +-- jest-e2e.json
|   |   +-- tsconfig.app.json
|   |-- book-service
|   |   |-- src
|   |   |   |-- book-service.controller.spec.ts
|   |   |   |-- book-service.controller.ts
|   |   |   |-- book-service.module.ts
|   |   |   |-- book-service.service.ts
|   |   |   +-- main.ts
|   |   |-- test
|   |   |   |-- app.e2e-spec.ts
|   |   |   +-- jest-e2e.json
|   |   +-- tsconfig.app.json
|   |-- borrow-service
|   |   |-- src
|   |   |   |-- borrow-service.controller.spec.ts
|   |   |   |-- borrow-service.controller.ts
|   |   |   |-- borrow-service.module.ts
|   |   |   |-- borrow-service.service.ts
|   |   |   +-- main.ts
|   |   |-- test
|   |   |   |-- app.e2e-spec.ts
|   |   |   +-- jest-e2e.json
|   |   +-- tsconfig.app.json
|   |-- category-service
|   |   |-- src
|   |   |   |-- category-service.controller.spec.ts
|   |   |   |-- category-service.controller.ts
|   |   |   |-- category-service.module.ts
|   |   |   |-- category-service.service.ts
|   |   |   +-- main.ts
|   |   |-- test
|   |   |   |-- app.e2e-spec.ts
|   |   |   +-- jest-e2e.json
|   |   +-- tsconfig.app.json
|   |-- fine-payment-service
|   |   |-- src
|   |   |   |-- fine-payment-service.controller.spec.ts
|   |   |   |-- fine-payment-service.controller.ts
|   |   |   |-- fine-payment-service.module.ts
|   |   |   |-- fine-payment-service.service.ts
|   |   |   +-- main.ts
|   |   |-- test
|   |   |   |-- app.e2e-spec.ts
|   |   |   +-- jest-e2e.json
|   |   +-- tsconfig.app.json
|   +-- member-service
|       |-- src
|       |   |-- main.ts
|       |   |-- member-service.controller.spec.ts
|       |   |-- member-service.controller.ts
|       |   |-- member-service.module.ts
|       |   +-- member-service.service.ts
|       |-- test
|       |   |-- app.e2e-spec.ts
|       |   +-- jest-e2e.json
|       +-- tsconfig.app.json
|-- .gitignore
|-- .prettierrc
|-- eslint.config.mjs
|-- nest-cli.json
|-- package.json
|-- package-lock.json
|-- README.md
|-- tsconfig.build.json
+-- tsconfig.json
```

## Notes

- `node_modules` is intentionally excluded from this structure file.
- The repository is organized as a NestJS monorepo with multiple microservice apps under `apps/`.
