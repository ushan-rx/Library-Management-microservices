# PHASED_DEVELOPMENT_PLAN.md

## Purpose
This document defines the phased implementation plan for the Library Management System microservices monorepo. It is designed for controlled, test-driven, traceable delivery. The project must be implemented in phases, with each phase producing a clear outcome and passing the required tests before moving forward.

This file is intended to be used together with:
- `AGENT_GUIDE.md`
- `README_SYSTEM.md`
- `API_CONTRACTS.md`
- `DATA_SCHEMAS.md`
- `API_GATEWAY.md`
- `AUTH_ARCHITECTURE.md`
- service-specific spec files

---

## Delivery Principles
- work strictly phase by phase
- do not start a new phase while required tests from the current phase are failing
- stop after each phase and ask the user whether to proceed
- update changelogs continuously
- record required spec changes in `SPEC_CHANGE_REQUESTS.md`
- maintain implementation alignment with approved specs

---

## Phase 0: Repository Audit and Planning Baseline

### Objective
Establish a reliable baseline of the monorepo and verify that the current scaffolding matches the intended architecture.

### Tasks
- inspect the existing NestJS project structure already created by the user
- map existing apps, folders, package manifests, and bootstrap files
- compare current state with the approved specs
- create or verify required docs and operating files
- create initial changelog files for each service and gateway
- create `SPEC_CHANGE_REQUESTS.md` if missing
- create root testing strategy notes if needed
- identify gaps between scaffold state and target state

### Deliverables
- audited repo structure summary
- missing documentation files created
- changelog files initialized
- baseline deviations recorded if any

### Success criteria
- the current project structure is understood and documented
- repo-level operational files exist
- there is a clear implementation starting point
- no code behavior changes yet beyond harmless setup and docs

### Tests to run
- basic workspace install check
- lint or bootstrap check if already configured
- no broken app bootstraps after documentation/setup additions

---

## Phase 1: Dockerized Resources and Shared Development Foundation

### Objective
Prepare the shared infrastructure and reusable development foundation for all services.

### Tasks
- create `docker-compose.yml` for PostgreSQL and any approved development resources
- define environment variable strategy and `.env.example`
- establish naming conventions for service ports, DB names, and secrets
- add shared base documentation for startup and configuration
- decide the exact local run model for services and gateway
- configure any shared testing utilities or base test setup helpers
- add logging conventions and request correlation plan

### Deliverables
- working docker compose for resource layer
- documented env contract
- stable database provisioning plan
- shared logging and testing conventions documented

### Success criteria
- dockerized resources can be started reliably
- each planned service has a defined database target or schema target
- environment configuration strategy is clear and reusable

### Tests to run
- container startup check
- database connectivity smoke test
- test utility bootstrap check if applicable

---

## Phase 2: Gateway Skeleton and Cross-Cutting Platform Utilities

### Objective
Prepare the API Gateway skeleton and shared platform concerns without implementing full business routes.

### Tasks
- scaffold gateway structure according to `API_GATEWAY.md`
- implement health route and base routing structure
- add structured request logging middleware/interceptor design
- add correlation id strategy
- add base error response handling at gateway level
- prepare gateway config loading and service URL resolution
- define public vs protected route groups at a structural level

### Deliverables
- gateway app boots correctly
- health endpoint works
- logging/error foundations exist
- service routing map skeleton exists

### Success criteria
- gateway is runnable
- gateway base middleware/interceptors behave correctly
- route registration foundation is stable

### Tests to run
- gateway unit tests for config and utility pieces
- gateway integration tests for health route
- gateway bootstrap test

---

## Phase 3: Auth Service Foundation

### Objective
Implement the Auth Service core model, security primitives, and auth workflows.

### Tasks
- set up Auth Service database schema
- implement user entity and repository/model layer
- implement password hashing
- implement register flow
- implement login flow
- implement JWT issuance
- implement token payload structure per auth architecture
- implement protected profile endpoint
- implement DTO validation and proper error handling
- add service logs for auth events without exposing sensitive data

### Deliverables
- working Auth Service with core endpoints
- auth-specific tests
- initial swagger for auth routes if enabled at this stage

### Success criteria
- users can register and login
- passwords are never stored in plain text
- JWTs are issued correctly
- protected profile endpoint requires valid auth

### Tests to run
- unit tests for auth service logic
- hashing tests
- login/register integration tests
- auth e2e tests for register, login, profile

---

## Phase 4: Gateway Auth Integration

### Objective
Connect gateway behavior to the authentication model so protected downstream access can be enforced consistently.

### Tasks
- implement gateway auth middleware/guard flow
- decide token validation strategy per `AUTH_ARCHITECTURE.md`
- propagate authenticated context safely downstream where approved
- define public auth routes at gateway
n- protect selected non-public routes
- implement gateway-level unauthorized/forbidden responses
- add logs for auth failures and protected access attempts

### Deliverables
- gateway enforces auth on protected route groups
- public routes remain accessible as specified
- downstream request forwarding includes approved identity context

### Success criteria
- protected routes reject missing or invalid tokens
- public routes remain functional
- gateway auth behavior aligns with specs

### Tests to run
- gateway auth unit tests
- integration tests for public vs protected routes
- invalid token and missing token tests

---

## Phase 5: Member Service

### Objective
Implement Member Service CRUD and validation behavior.

### Tasks
- set up Member Service schema and persistence
- implement create/list/get/update/delete member APIs
- implement validation rules
- enforce auth/role rules if applicable for write operations
- add structured logging
- add Swagger annotations if in implementation scope

### Deliverables
- working Member Service CRUD
- member tests
- member changelog updates

### Success criteria
- all member CRUD endpoints behave according to contract
- validation and not-found handling work correctly
- write protections behave as specified

### Tests to run
- unit tests for member service
- integration tests for member persistence
- e2e tests for member CRUD via service and via gateway once routing exists

---

## Phase 6: Category Service

### Objective
Implement Category Service CRUD and validation behavior.

### Tasks
- set up Category Service schema and persistence
- implement create/list/get/update/delete category APIs
- implement uniqueness or validation rules if specified
- protect write operations as required
- add structured logging

### Deliverables
- working Category Service CRUD
- category tests

### Success criteria
- category endpoints match contract
- validation and error handling are correct
- route protections are correct

### Tests to run
- unit tests for category service
- integration tests for category persistence
- gateway route tests once route forwarding is enabled

---

## Phase 7: Book Service

### Objective
Implement Book Service CRUD and category linkage behavior.

### Tasks
- set up Book Service schema and persistence
- implement create/list/get/update/delete book APIs
- enforce data validation
- manage `totalCopies` and `availableCopies` consistency rules
- decide category validation strategy based on spec-approved approach
- add logs around inventory changes

### Deliverables
- working Book Service CRUD
- copy count rules implemented
- book tests

### Success criteria
- book endpoints match contract
- copy counts remain consistent
- category linkage behaves as specified
- write protections are correct

### Tests to run
- unit tests for book service business rules
- integration tests for persistence
- tests for copy count invariants
- gateway route tests once routing exists

---

## Phase 8: Borrow Service Core Orchestration

### Objective
Implement borrow creation and return processing with direct service-to-service validation.

### Tasks
- set up Borrow Service schema and persistence
- implement create/list/get/update/delete borrow APIs as specified
- implement borrow eligibility checks
- implement direct HTTP validation calls to Member Service and Book Service where required
- implement borrow creation flow
- implement return processing flow
- update book availability through approved service communication
- add logs for orchestration steps and downstream calls
- handle downstream failure scenarios cleanly

### Deliverables
- working Borrow Service with orchestration behavior
- borrow tests including service-call scenarios

### Success criteria
- borrow creation enforces member and book validation
- return processing updates status correctly
- book availability updates are handled correctly
- downstream failures return controlled errors

### Tests to run
- unit tests for borrow rules
- integration tests for borrow persistence
- mocked service-call tests for member/book checks
- e2e tests for borrow and return flows

---

## Phase 9: Fine Payment Service

### Objective
Implement fine record and payment handling.

### Tasks
- set up Fine Payment Service schema and persistence
- implement create/list/get/update/delete fine endpoints as specified
- support fine payment status changes
- integrate with borrow workflow if the spec requires borrow-triggered fine creation
- add structured logging for fine and payment state changes

### Deliverables
- working Fine Payment Service
- fine tests

### Success criteria
- fine records can be created and updated correctly
- payment status flows are consistent
- any borrow-service interaction behaves correctly

### Tests to run
- unit tests for fine service rules
- integration tests for persistence
- e2e tests for fine creation and update

---

## Phase 10: Complete Gateway Route Forwarding

### Objective
Implement the full API Gateway route forwarding across all services.

### Tasks
- wire route groups to all downstream services
- forward path, method, query, headers, and body correctly
- handle downstream errors consistently
- ensure auth behavior is respected per route group
- add gateway-level request and response visibility logs
- finalize health and readiness style routes if planned

### Deliverables
- full gateway forwarding across all services
- gateway route tests

### Success criteria
- all route groups are accessible through the gateway as specified
- protected routes behave correctly through the gateway
- downstream error mapping is stable and understandable

### Tests to run
- gateway integration tests per route group
- auth-protected gateway tests
- end-to-end route forwarding tests

---

## Phase 11: Swagger and API Documentation Integration

### Objective
Expose and verify API documentation across services and the gateway demonstration path.

### Tasks
- enable Swagger for each service
- ensure DTOs and response shapes are documented cleanly
- verify endpoint visibility and contract alignment
- decide and implement how gateway-related documentation proof will be shown
- prepare a screenshot checklist and documentation evidence list

### Deliverables
- Swagger enabled for services
- documentation proof plan ready

### Success criteria
- each service has usable Swagger documentation
- the documentation reflects implemented contracts
- screenshot targets for assignment evidence are clear

### Tests to run
- documentation smoke tests if practical
- route availability checks for docs endpoints

---

## Phase 12: Cross-Service End-to-End Business Flows

### Objective
Validate the whole system through business flows.

### Tasks
- implement e2e scenarios through the gateway
- validate register/login flow
- validate category creation and book creation
- validate member creation
- validate borrow flow
- validate return flow
- validate fine flow if applicable
- verify role and auth protections in end-to-end scenarios

### Deliverables
- stable end-to-end test suite for critical business flows
- verified system behavior through the gateway

### Success criteria
- major user journeys pass end-to-end
- service interactions behave correctly in sequence
- no blocking regression remains in the critical path

### Tests to run
- full gateway-based e2e suite
- regression suite across critical flows

---

## Phase 13: Observability, Hardening, and Cleanup

### Objective
Improve reliability, logs, consistency, and maintainability before final presentation preparation.

### Tasks
- review and improve logs across services
- standardize error responses where specified
- remove dead code and unsafe shortcuts
- ensure comments explain non-obvious areas
- review env handling and secret hygiene
- improve startup messages and failure visibility
- ensure changelogs are up to date

### Deliverables
- cleaner codebase
- stronger logs and error clarity
- updated changelogs

### Success criteria
- system behavior is observable enough for debugging and demo support
- sensitive data is not leaked in logs
- non-obvious code paths are understandable

### Tests to run
- regression suite
- selected smoke tests after cleanup

---

## Phase 14: Assignment Evidence Preparation

### Objective
Prepare all artifacts required to support the assignment submission and slide deck.

### Tasks
- gather direct service endpoint proof
- gather gateway endpoint proof
- gather native Swagger screenshots
- gather gateway-related evidence required by assignment
- finalize architecture diagram inputs
- finalize service responsibility summary tables
- finalize contribution mapping inputs
- verify the system matches assignment wording and expectations

### Deliverables
- complete evidence checklist
- slide-ready content inputs
- screenshot inventory

### Success criteria
- all assignment evidence targets are accounted for
- slide preparation can proceed without missing technical proof

### Tests to run
- final smoke test of the demonstrated routes
- final auth and gateway flow sanity checks

---

## Phase 15: Final Stabilization and Release Candidate

### Objective
Freeze the implementation into a stable candidate for presentation or handoff.

### Tasks
- perform final regression run
- verify docs are consistent with implementation
- verify changelogs are current
- verify spec change log is current
- ensure root setup instructions are accurate
- remove leftover debug artifacts that should not remain

### Deliverables
- stable release candidate
- final verification summary

### Success criteria
- all required tests pass
- documentation matches actual behavior
- the codebase is ready for demo, review, or further extension

### Tests to run
- full regression suite
- startup smoke tests for all services and gateway
- final end-to-end scenario validation

---

## Per-Phase Completion Template
At the end of every phase, report in this shape:

```md
Phase X completed.

Completed work:
- ...
- ...

Tests run:
- ...
- ...

Result:
- all required tests passed
or
- failing tests remain: ...

Docs updated:
- ...

Changelogs updated:
- ...

Spec changes recorded:
- none
or
- SCR-00X proposed

Proceed to the next phase?
```

---

## Final Note
This plan is intentionally conservative. It prioritizes correctness, traceability, and assignment-safe progress over speed. The project should be built as a sequence of completed, tested, reviewable increments rather than one large unverified implementation pass.
