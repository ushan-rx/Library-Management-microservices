# AGENT_GUIDE.md

## Purpose

This document defines how the coding agent must execute work for the Library Management System monorepo. It is an operational guide, not a business spec. The agent must use this file together with the system specs as the source of truth for implementation behavior, delivery discipline, and change control.

The goals of this guide are:

- keep implementation aligned with the approved specs
- enforce phased delivery
- enforce TDD and regression safety
- make changes traceable
- improve visibility through logs and changelogs
- reduce the risk of uncontrolled architecture drift

---

## Mandatory Source Documents

The agent must read and follow these files before making or changing implementation decisions:

- `docs/specs/README_SYSTEM.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/DATA_SCHEMAS.md`
- `docs/specs/API_GATEWAY.md`
- `docs/specs/AUTH_ARCHITECTURE.md`
- `docs/services/AUTH_SERVICE.md`
- `docs/services/MEMBER_SERVICE.md`
- `docs/services/CATEGORY_SERVICE.md`
- `docs/services/BOOK_SERVICE.md`
- `docs/services/BORROW_SERVICE.md`
- `docs/services/FINE_PAYMENT_SERVICE.md`
- `docs/agents/PHASED_DEVELOPMENT_PLAN.md`
- this file: `docs/agents/AGENT_GUIDE.md`

If there is any conflict:

1. security and correctness come first
2. explicit service spec comes before general summary text
3. API contracts and data schemas must not be changed casually
4. if a real conflict exists, pause implementation of the conflicting part and record it in `docs/agents/SPEC_CHANGE_REQUESTS.md`

---

## Core Working Rules

### 1. Always follow the specs

The agent must not invent behavior, schemas, workflows, or endpoints that contradict the specs.

Allowed:

- clarifying implementation details that do not violate the specs
- adding small internal helpers, utilities, mappers, validators, and logging support
- improving structure when it preserves the contract and schema

Not allowed:

- changing route shapes without recording and justifying a spec change
- changing entity relationships without recording and justifying a spec change
- changing auth behavior, response shapes, or status semantics without recording and justifying a spec change
- replacing the chosen communication model with a different one

### 2. Build in phases only

The agent must execute work phase by phase according to `docs/agents/PHASED_DEVELOPMENT_PLAN.md`.
The agent must not jump ahead or partially implement future phases unless a current phase explicitly requires prerequisites.

### 3. Use TDD for all meaningful business behavior

For each phase:

- write or update tests first where practical
- implement until tests pass
- run the relevant test suite before considering the phase complete
- do not proceed while the current phase has failing required tests

For each completed phase:

- run tests
- confirm whether they pass or fail
- summarize what changed
- provide a brief plain-language note explaining what the completed phase does
- provide a concise Git commit message that accurately describes the completed phase
- ask the user to proceed before starting the next phase

### 4. Stop at phase boundaries

After each phase is complete and tests have run, the agent must stop and ask the user whether to proceed to the next phase.
The agent must not continue automatically to the next phase.

### 5. Maintain changelogs continuously

Each service and key component must have its own changelog file.
The agent must update the relevant changelog after every meaningful change.
Each entry must include timestamp, scope, summary, and impact.

### 6. Record required spec changes separately

If the implementation reveals that a spec must be updated, the agent must not silently modify the behavior.
Instead:

- implement only if the change is safe and explicitly necessary for correctness, or pause if approval is required
- document the proposed change in `docs/agents/SPEC_CHANGE_REQUESTS.md`
- explain the reason, affected files, and impact
- keep the implementation aligned with the latest approved version of the spec

### 7. Add logs for visibility

The system must include structured logs sufficient to observe:

- service startup
- incoming requests
- validation failures
- external service calls
- major state changes
- auth failures
- exceptional paths

Logs must avoid leaking secrets, password hashes, raw tokens, or sensitive internal data.

### 8. Include code comments that improve maintainability

Use comments to explain:

- why a non-obvious decision exists
- service boundaries
- validation intent
- important side effects
- critical transaction or consistency reasoning

Do not add noisy comments that merely restate obvious code.

### 9. Prefer clarity over cleverness

The implementation must be straightforward, explicit, and maintainable.
Avoid over-abstracting early.
Avoid introducing frameworks or patterns not justified by the project needs.

### 10. Keep the project Docker-first for resources

Use Dockerized resources for external dependencies such as PostgreSQL.
Application services may run locally during development if that speeds iteration, but the resource layer must be dockerized and reproducible.

---

## Required Repository Operating Files

The agent must ensure the repository contains and maintains the following classes of files.

### Repository operating files

- `docs/specs/README_SYSTEM.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/DATA_SCHEMAS.md`
- `docs/specs/API_GATEWAY.md`
- `docs/specs/AUTH_ARCHITECTURE.md`
- `docs/agents/PHASED_DEVELOPMENT_PLAN.md`
- `docs/agents/AGENT_GUIDE.md`
- `docs/agents/SPEC_CHANGE_REQUESTS.md`
- `docker-compose.yml`
- `.env.example`
- `README.md`

### Service-specific docs

For each service:

- service spec file in `docs/services/`
- service changelog in `docs/changelogs/`
- test notes if needed in service docs or testing docs

### Suggested changelog files

- `docs/changelogs/API_GATEWAY_CHANGELOG.md`
- `docs/changelogs/AUTH_SERVICE_CHANGELOG.md`
- `docs/changelogs/MEMBER_SERVICE_CHANGELOG.md`
- `docs/changelogs/CATEGORY_SERVICE_CHANGELOG.md`
- `docs/changelogs/BOOK_SERVICE_CHANGELOG.md`
- `docs/changelogs/BORROW_SERVICE_CHANGELOG.md`
- `docs/changelogs/FINE_PAYMENT_SERVICE_CHANGELOG.md`

---

## Changelog Format

Every changelog entry should use this format:

```md
## 2026-03-27T18:30:00+05:30

- Scope: auth-service
- Type: feature | fix | refactor | docs | test | chore
- Summary: Added login endpoint with JWT issuance and credential validation.
- Files: src/auth/auth.controller.ts, src/auth/auth.service.ts, test/auth.e2e-spec.ts
- Impact: Enables authenticated access to protected gateway routes.
- Notes: No API contract deviation.
```

Rules:

- use ISO 8601 timestamps with timezone
- keep entries append-only
- do not rewrite history unless correcting a factual error
- clearly mention contract or schema impact if any

---

## Spec Change Request Format

All required changes to approved specs must go into `docs/agents/SPEC_CHANGE_REQUESTS.md`.

Use this format:

```md
## SCR-001

- Date: 2026-03-27T18:45:00+05:30
- Status: proposed | approved | rejected | implemented
- Requested by: agent
- Affected specs: docs/specs/API_CONTRACTS.md, docs/specs/DATA_SCHEMAS.md
- Affected services: borrow-service, fine-payment-service
- Reason:
  The original fine creation flow does not define whether fine records can be created before return is processed.
- Proposed change:
  Clarify that fine creation occurs only after return processing when overdue days are known.
- Implementation impact:
  No route shape changes. Business rule clarified.
- Risk:
  Low.
```

Rules:

- keep each request uniquely identified
- do not silently delete or overwrite old requests
- mark status transitions clearly

---

## Testing Strategy

### TDD expectations

The agent must aim for test-first development for business logic and contract-critical behavior.
Where full test-first is impractical for scaffolding, the agent must add the missing tests immediately after structure creation and before phase completion.

### Required test layers

The project should include the following test categories where relevant:

1. Unit tests

- service-level business rules
- validation helpers
- auth logic
- fine calculation logic
- borrow eligibility checks

2. Integration tests

- repository and database interactions
- auth token flow
- gateway route forwarding behavior
- service-to-service HTTP orchestration behavior using mocks or test doubles where suitable

3. E2E tests

- public API flows through the gateway
- critical business flows such as login, create member, create book, borrow book, return book, create fine

### Before moving to next phase

For each phase, the agent must:

- run the relevant tests for the work completed in that phase
- confirm whether tests passed
- report any failing tests and root causes
- fix required failures before asking to proceed

### Minimum safety rule

No new phase begins with known failing required tests from an earlier completed phase.

---

## Phase Execution Protocol

For each phase in `docs/agents/PHASED_DEVELOPMENT_PLAN.md`, the agent must follow this sequence:

1. Read the phase scope and dependencies.
2. State what will be done in the current phase only.
3. Write or update tests for that phase.
4. Implement the phase.
5. Update relevant documentation if implementation details were clarified.
6. Update service changelogs.
7. Run tests.
8. Summarize results.
9. Provide a brief note explaining what the completed phase does.
10. Provide a concise Git commit message for the completed phase.
11. Ask the user whether to proceed to the next phase.

The agent must not combine multiple phases into one large change unless the plan explicitly defines them as inseparable.

---

## Logging Guidance

Use structured, consistent application logs.
Recommended log fields:

- timestamp
- level
- service name
- request id or correlation id
- route
- method
- actor id if available
- result status
- duration if available
- downstream service target if applicable

Examples of events that must be logged:

- service startup and shutdown
- database connection success or failure
- request received
- request completed
- validation failure
- unauthorized or forbidden access attempt
- downstream service call started and completed
- borrow created
- return processed
- fine created or payment confirmed

Do not log:

- raw passwords
- password hashes
- raw JWTs
- secrets from environment variables
- full sensitive payloads unnecessarily

---

## Code Comment Guidance

Include comments where they help a future maintainer understand intent.
Good places for comments:

- why gateway forwards certain headers
- why a route is protected or public
- why a borrow workflow requires pre-checks
- why fine generation happens at a specific stage
- why a transaction boundary exists
- why a DTO intentionally excludes certain fields

Avoid comments like:

- increment counter
- create array
- call function

---

## Service Communication Rules

The project uses synchronous REST over HTTP for service-to-service communication.
Do not introduce event-driven communication, message brokers, or asynchronous transport unless a spec change is approved.

Rules:

- client-to-system traffic goes through API Gateway
- internal service-to-service calls are direct where required
- downstream failures must be handled explicitly
- service boundaries must remain intact
- no service may read another service's database directly

The Borrow Service is the main orchestration point for borrow and return flows.

---

## Auth and Security Rules

The auth model is mandatory and must be handled properly.

Rules:

- use JWT access tokens
- password storage must use secure hashing
- protect non-public write endpoints according to auth architecture
- keep Auth Service data separate from library member records
- propagate authenticated identity safely through gateway and service layers
- avoid hardcoding secrets
- use environment configuration
- keep authorization rules explicit and documented

If a guard, role rule, or token payload changes, record it in changelog and spec change file if it affects the contract or architecture.

---

## Docker and Environment Guidance

Use dockerized resources for repeatability.

Expected resource direction:

- PostgreSQL via Docker Compose
- optional admin tools only if helpful and controlled

Rules:

- provide clear environment variables
- document ports and connection strings
- avoid machine-specific assumptions
- ensure local startup steps are deterministic

---

## Quality Bar Before Declaring a Phase Complete

A phase is complete only if:

- its scoped tasks are implemented
- required tests pass
- documentation was updated if needed
- changelog entries were added
- no known blocking regression remains in completed scope
- the user was informed of results and asked whether to proceed

---

## Suggested Response Style for the Agent During Execution

At the end of each phase, the agent should report:

- what was completed
- what tests were run
- whether tests passed
- a brief note explaining what the phase delivers or enables
- a suggested Git commit message for the completed phase
- any non-blocking notes
- changelog/spec updates made
- a clear question asking whether to continue to the next phase

Example:

```md
Phase 3 completed.

Completed:

- implemented member CRUD
- added validation and service tests
- updated MEMBER_SERVICE_CHANGELOG.md

Tests run:

- member unit tests
- member integration tests
- gateway routing smoke tests for member routes

Result:

- all tests passed

What this phase does:

- establishes the member management capability used by staff

Suggested commit message:

- `feat(member-service): implement member CRUD with validation`

Spec changes:

- none

Proceed to Phase 4?
```

---

## Final Principle

The agent is expected to behave like a disciplined engineering executor, not a rapid code generator. The project base docs are the source of truth, phase control is mandatory, TDD is mandatory, changelog discipline is mandatory, and spec changes must always be explicit and traceable.
