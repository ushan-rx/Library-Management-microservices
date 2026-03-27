# Library System Microservices

NestJS monorepo for a Library Management System implemented as an API Gateway plus six backend services.

Current implementation status:

- Phase 0 baseline audit completed
- service apps exist as Nest scaffolds only
- business logic has not started yet

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
