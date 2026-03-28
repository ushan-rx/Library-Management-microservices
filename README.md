# Library System Microservices

NestJS monorepo for a Library Management System implemented as an API Gateway plus six backend services.

Current implementation status:

- Phase 0 baseline audit completed
- Phase 1 shared Docker and Prisma foundation completed
- Phase 2 API Gateway skeleton completed
- the API Gateway is now runnable for health and base middleware/error checks
- the Auth Service is now runnable for register, login, token validation, profile, and health checks
- the Member Service is now runnable for member CRUD, eligibility checks, and health checks

Service apps:

- `api-gateway`
- `auth-service`
- `member-service`
- `category-service`
- `book-service`
- `borrow-service`
- `fine-payment-service`

Canonical project specifications live under `docs/`:

- `docs/specs/README_SYSTEM.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/DATA_SCHEMAS.md`
- `docs/specs/API_GATEWAY.md`
- `docs/specs/AUTH_ARCHITECTURE.md`
- `docs/services/*.md`
- `docs/agents/AGENT_GUIDE.md`
- `docs/agents/PHASED_DEVELOPMENT_PLAN.md`
- `docs/agents/SPEC_CHANGE_REQUESTS.md`

Phase 0 operating notes:

- required operating files have been initialized
- changelog files exist under `docs/changelogs/`
- repository audit summary exists at `docs/agents/PHASE_0_REPOSITORY_AUDIT.md`
- `docs/agents/SPEC_CHANGE_REQUESTS.md`, `docker-compose.yml`, and `.env.example` are placeholders for Phase 1 implementation

Useful commands:

```bash
npm run build
npm run test
npm run lint
npm run test:e2e
```

Phase 1 infrastructure commands:

```bash
npm run docker:up
npm run docker:down
npm run docker:logs:postgres
```

Gateway check commands:

```bash
npm run start
```

Then check:

```bash
GET http://localhost:3000/health
GET http://localhost:3000/missing
```

Auth service check commands:

```bash
npm run start:auth-service
```

Then check:

```bash
GET http://localhost:3001/auth/health
POST http://localhost:3001/auth/register
POST http://localhost:3001/auth/login
GET http://localhost:3001/auth/profile
POST http://localhost:3001/auth/validate
```

Member service check commands:

```bash
npm run start:member-service
```

Then check:

```bash
GET http://localhost:3002/members/health
POST http://localhost:3002/members
GET http://localhost:3002/members
GET http://localhost:3002/members/:memberId/eligibility
```

Prisma validation commands:

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

Implementation must follow the phased delivery rules in `docs/agents/AGENT_GUIDE.md`.
