# Library System Microservices - System Overview and Build Specification

## 1. Purpose of this document

This document is the top-level source of truth for the `library-system-microservices` project. It explains the system as a whole so an implementation agent can build the codebase correctly and consistently across all services.

This project is a NestJS monorepo that currently contains the following apps under `apps/`:

- `api-gateway`
- `auth-service`
- `member-service`
- `book-service`
- `category-service`
- `borrow-service`
- `fine-payment-service`

At the moment only the NestJS project skeletons exist. No real business logic has been implemented yet.

The goal is to build a complete backend for a Library Management System using a microservices style with an API Gateway, REST APIs, Dockerized infrastructure resources, clean service boundaries, consistent error handling, shared conventions, Swagger documentation, and production-style project organization.

---

## 2. System scope

The system manages the following business capabilities:

1. authentication and authorization
2. member management
3. book catalog and inventory management
4. category management for classifying books
5. borrowing and return tracking
6. fine creation and fine payment tracking

This system is intentionally scoped as an MVP. It must be realistic, properly structured, and complete enough for academic demonstration and future extension, but it should avoid unnecessary complexity.

Out of scope for the first implementation:

- email notifications
- event-driven messaging
- distributed transactions
- saga orchestration
- advanced analytics
- search indexing engines
- caching layers
- external payment provider integration
- file uploads
- frontend application
- multi-branch library support
- audit log service as a separate microservice

These can be added later if needed.

---

## 3. Architecture summary

### 3.1 Architectural style

The system uses synchronous REST communication over HTTP.

Communication model:

- external clients call the API Gateway
- the API Gateway routes requests to the appropriate backend service
- services call each other directly over internal HTTP only when business validation or business coordination is required
- there is no event broker in the first implementation

### 3.2 Why REST-only for now

REST is chosen because:

- it is easy to implement and test with Swagger and Postman
- it suits the assignment requirements well
- it minimizes infrastructure and debugging complexity
- the core business flows require immediate request-response validation

### 3.3 Main architectural principle

Each service owns its own data and business logic. Services do not access each other’s database directly.

Services communicate using:

- HTTP requests for validation and coordination
- external IDs such as `memberId`, `bookId`, `borrowId`, and `categoryId`

---

## 4. Service list and responsibilities

### 4.1 API Gateway

The single public entry point.

Responsibilities:

- route incoming requests to downstream services
- enforce authentication for protected routes where required
- forward correlation IDs and auth context
- provide centralized CORS, request logging, and error normalization
- aggregate Swagger or expose service-specific documentation routes if implemented later

### 4.2 Auth Service

Responsibilities:

- user registration
- user login
- password hashing
- JWT issuance
- user role assignment
- profile lookup for authenticated users
- token validation support for gateway or downstream use

Roles:

- `ADMIN`
- `LIBRARIAN`
- `MEMBER`

### 4.3 Member Service

Responsibilities:

- create, view, update, and deactivate members
- store library member profile and status
- validate whether a member is active and allowed to borrow

### 4.4 Category Service

Responsibilities:

- create, view, update, and deactivate categories
- classify books under categories

### 4.5 Book Service

Responsibilities:

- create, view, update, and deactivate books
- maintain book inventory counts
- ensure `availableCopies` never exceeds `totalCopies`
- handle copy adjustments when books are borrowed or returned

### 4.6 Borrow Service

Responsibilities:

- create borrow records
- process returns
- determine overdue state
- coordinate with Member Service and Book Service during borrow flow
- coordinate with Fine Payment Service for fine generation when required

### 4.7 Fine Payment Service

Responsibilities:

- create fine records
- track fine payment state
- record payment details for fines
- expose fine lookup by member and by borrow record

---

## 5. Recommended ports and internal DNS names

### 5.1 Local development ports

- API Gateway: `3000`
- Auth Service: `3001`
- Member Service: `3002`
- Book Service: `3003`
- Category Service: `3004`
- Borrow Service: `3005`
- Fine Payment Service: `3006`

### 5.2 Docker Compose service names

Recommended Docker Compose internal hostnames:

- `api-gateway`
- `auth-service`
- `member-service`
- `book-service`
- `category-service`
- `borrow-service`
- `fine-payment-service`
- `postgres-auth`
- `postgres-member`
- `postgres-book`
- `postgres-category`
- `postgres-borrow`
- `postgres-fine`

The apps should resolve each other by Docker service name inside the compose network.

---

## 6. Dockerized resource strategy

### 6.1 Why Dockerized resources

The project should use Dockerized resources so the system is portable, repeatable, and simple to bootstrap for implementation and demo.

### 6.2 Minimum Dockerized resources

Use Docker Compose to run:

- one PostgreSQL container per service, or
- one PostgreSQL container with separate databases

Recommended for clarity and isolation:

- separate PostgreSQL database per service, inside one PostgreSQL server container or separate containers

Best balance for this project:

- one PostgreSQL container named `postgres-core`
- separate databases inside it:
  - `auth_db`
  - `member_db`
  - `book_db`
  - `category_db`
  - `borrow_db`
  - `fine_db`

This keeps infra simpler while still preserving logical ownership.

Alternative:

- separate PostgreSQL container per service if strict isolation is preferred

### 6.3 Required environment variables per service

Each service should read these from env files:

- `PORT`
- `NODE_ENV`
- `SERVICE_NAME`
- `DATABASE_URL`
- `JWT_SECRET` where relevant
- `JWT_EXPIRES_IN` where relevant
- downstream base URLs where relevant
- `LOG_LEVEL`

### 6.4 Docker Compose expectations

The future `docker-compose.yml` should support:

- local development startup of databases
- optional startup of all services
- shared Docker network
- health checks for databases and services
- mounted source volumes for development if desired

---

## 7. Data ownership model

This is a critical rule.

Each service owns only its own data model.

### 7.1 Ownership boundaries

- Auth Service owns users, credentials, and auth profile records
- Member Service owns library member records
- Category Service owns category records
- Book Service owns book records and inventory state
- Borrow Service owns borrow records and return processing state
- Fine Payment Service owns fine records and fine payment records

### 7.2 No cross-database reads

No service may connect directly to another service’s database. If a service needs external validation or details, it must call the owning service via HTTP.

---

## 8. Inter-service communication model

### 8.1 General rule

Service-to-service communication should be minimal and purposeful.

### 8.2 Allowed direct service interactions

#### Borrow Service calls Member Service

For:

- member existence validation
- active membership validation
- optional member block status validation

#### Borrow Service calls Book Service

For:

- book existence validation
- inventory availability validation
- decrementing available copies during borrow
- incrementing available copies during return

#### Borrow Service calls Fine Payment Service

For:

- fine creation after overdue return
- fine lookup by borrow record if needed

#### Book Service may call Category Service

Optional and only if required at write time to validate `categoryId`

Preferred approach:

- validate `categoryId` on create and update
- do not repeatedly call Category Service for every read operation

### 8.3 Services that should remain mostly standalone

- Auth Service
- Member Service
- Category Service
- Fine Payment Service

### 8.4 Should services call through the gateway

No. Internal service-to-service calls should go directly to the target service, not through the gateway.

The gateway is primarily for client-to-system communication.

---

## 9. Core business workflows

### 9.1 Register user account

Flow:

1. client calls `POST /auth/register` through gateway
2. gateway forwards to Auth Service
3. Auth Service validates uniqueness of username/email
4. Auth Service hashes password
5. Auth Service creates auth user record
6. Auth Service returns sanitized user info and token or registration success response

### 9.2 Login

Flow:

1. client calls `POST /auth/login`
2. Auth Service verifies credentials
3. Auth Service issues JWT access token
4. response returns token, expiration, and user role

### 9.3 Create category

1. authorized admin or librarian calls `POST /categories`
2. gateway authenticates and forwards
3. Category Service creates category

### 9.4 Create book

1. authorized admin or librarian calls `POST /books`
2. Book Service validates payload
3. Book Service optionally validates category existence via Category Service
4. Book Service stores book record

### 9.5 Create member

1. authorized librarian or admin calls `POST /members`
2. Member Service creates member record

### 9.6 Borrow a book

1. client calls `POST /borrows`
2. gateway authenticates and forwards to Borrow Service
3. Borrow Service validates input
4. Borrow Service calls Member Service to verify member exists and is active
5. Borrow Service calls Book Service to verify book exists and available copies > 0
6. Borrow Service creates borrow record
7. Borrow Service calls Book Service to decrement available copies
8. Borrow Service returns created borrow record

### 9.7 Return a book

1. client calls `POST /borrows/{borrowId}/return`
2. Borrow Service verifies borrow record exists and is not already returned
3. Borrow Service marks returned
4. Borrow Service calls Book Service to increment available copies
5. Borrow Service determines whether overdue fine applies
6. if overdue, Borrow Service calls Fine Payment Service to create fine
7. Borrow Service returns return result including whether fine was generated

### 9.8 Pay a fine

1. client calls `POST /fines/{fineId}/payments`
2. Fine Payment Service validates fine exists and is unpaid or partially paid as supported
3. Fine Payment Service records payment and updates fine status
4. response returns payment receipt data

---

## 10. Security model

### 10.1 Auth approach

Use JWT bearer authentication.

### 10.2 Password handling

Passwords must be hashed using bcrypt or argon2. Never store plaintext passwords.

### 10.3 Authorization model

Use simple role-based access control.

Suggested access model:

- `ADMIN`: full access to all management endpoints
- `LIBRARIAN`: access to categories, books, members, borrows, and fine management
- `MEMBER`: limited to self-facing endpoints if such endpoints are added later

For the MVP, most management endpoints can be restricted to `ADMIN` and `LIBRARIAN`.

### 10.4 Gateway responsibility

Gateway should:

- extract and validate bearer token for protected routes
- optionally call Auth Service token validation endpoint, or verify JWT itself if shared secret/public key model is used
- forward auth context headers to downstream services

Recommended simpler approach:

- gateway verifies JWT using shared secret
- downstream services may trust forwarded user context headers, or also verify JWT if defense in depth is desired

### 10.5 Forwarded auth context headers

Gateway can forward:

- `x-user-id`
- `x-user-role`
- `x-username`
- `x-correlation-id`

Downstream services must treat these headers as trusted only when the request originates from the gateway.

---

## 11. API conventions

### 11.1 Response shape

Use a consistent JSON response convention.

Suggested successful response shape:

```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "id": "..."
  }
}
```

Suggested error response shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "title",
        "message": "title must not be empty"
      }
    ]
  }
}
```

### 11.2 ID strategy

Use UUIDs across all services. This avoids sequence collisions and makes distributed records easier to manage.

### 11.3 Timestamps

All major entities should include:

- `createdAt`
- `updatedAt`

Some entities also need:

- `deletedAt`
- `returnedAt`
- `paymentDate`
- `lastLoginAt`

Use UTC timestamps.

### 11.4 Soft delete policy

Prefer soft deletion where deletion affects historical consistency.

Recommended:

- soft delete categories
- soft delete books
- soft delete members

Borrow and payment records should generally remain immutable historical records and should not be hard deleted in normal flows.

### 11.5 Pagination and filtering

For list endpoints use query params:

- `page`
- `limit`
- `sortBy`
- `sortOrder`
- service-specific filters

Default page size can be 10 or 20.

---

## 12. Logging and observability

### 12.1 Logging

Each service should log:

- startup configuration summary excluding secrets
- incoming request method and path
- outbound service call target and status
- business events such as borrow created and fine generated
- error stack traces in non-production mode

### 12.2 Correlation ID

Gateway should create or propagate `x-correlation-id`.

All downstream services should log with the correlation ID.

### 12.3 Health endpoints

Each service should expose:

- `GET /health`

The endpoint should report service health and optionally database connectivity status.

---

## 13. Validation and business rules

### 13.1 Member rules

- email should be unique within Member Service if stored there as business contact
- membership status may be `ACTIVE`, `INACTIVE`, or `BLOCKED`
- blocked or inactive members cannot borrow

### 13.2 Category rules

- category name should be unique among active categories
- category can be soft deleted, but existing books should remain historically valid

### 13.3 Book rules

- ISBN should be unique if provided
- `totalCopies` must be >= 0
- `availableCopies` must be >= 0
- `availableCopies` must be <= `totalCopies`
- a book with zero available copies cannot be borrowed

### 13.4 Borrow rules

- a member must exist and be active to borrow
- a book must exist and have `availableCopies > 0`
- the same borrow record cannot be returned twice
- due date should be after borrow date
- return date cannot be before borrow date

Optional policy for first version:

- no maximum borrow limit enforcement unless explicitly added later

### 13.5 Fine rules

- a fine is tied to one borrow record
- a fine should not be duplicated for the same overdue borrow unless explicit split-payment support exists
- payment amount should match the fine amount for the MVP unless partial payments are intentionally supported

---

## 14. Suggested repository evolution

The current monorepo skeleton should evolve into a richer structure.

Recommended shared top-level structure:

```text
.
├── apps/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── member-service/
│   ├── book-service/
│   ├── category-service/
│   ├── borrow-service/
│   └── fine-payment-service/
├── libs/
│   ├── common/
│   ├── config/
│   ├── contracts/
│   ├── auth/
│   └── logging/
├── docs/
│   ├── services/
│   ├── shared/
│   ├── README_SYSTEM.md
│   ├── API_CONTRACTS.md
│   ├── DATA_SCHEMAS.md
│   ├── API_GATEWAY.md
│   └── AUTH_ARCHITECTURE.md
├── docker/
│   ├── postgres/
│   └── scripts/
├── .env
├── .env.example
├── docker-compose.yml
└── README.md
```

### 14.1 Shared libs expectation

Suggested shared libs:

- request/response DTO helpers
- exception formatters
- auth decorators and guards
- logger utilities
- config helpers
- correlation ID middleware/interceptor

Do not put business logic for a specific service into shared libs.

---

## 15. Testing strategy

### 15.1 Unit tests

Each service should have unit tests for:

- service methods
- validation behavior
- edge cases

### 15.2 Integration tests

Each service should have integration tests for:

- controller to database flow
- health endpoint
- core create/read/update actions

### 15.3 Cross-service tests

At least the following workflows should be tested end-to-end:

- login and authenticated call
- create category then create book
- create member then borrow book
- return book and generate fine
- pay fine

### 15.4 Gateway tests

Test that gateway routes correctly and protects restricted endpoints.

---

## 16. Swagger expectations

Each service should expose Swagger docs.

Recommended local docs paths:

- `http://localhost:3001/docs`
- `http://localhost:3002/docs`
- `http://localhost:3003/docs`
- `http://localhost:3004/docs`
- `http://localhost:3005/docs`
- `http://localhost:3006/docs`

Gateway docs options:

- expose its own docs for routed endpoints
- or provide a top-level docs page linking to service docs

For this project, service-level docs are mandatory. Gateway-level aggregation is optional.

---

## 17. Build sequence for Codex agent

Recommended build order:

1. shared conventions and config base
2. Docker Compose and database bootstrap
3. Auth Service
4. Category Service
5. Book Service
6. Member Service
7. Borrow Service
8. Fine Payment Service
9. API Gateway
10. tests and docs

Why this order:

- Auth establishes security model
- Category and Book establish catalog
- Member establishes borrowers
- Borrow depends on Member and Book
- Fine depends on Borrow workflow
- Gateway comes after services are stable

---

## 18. Non-functional expectations

- code must be clean and modular
- services must start independently
- services must fail gracefully with clear errors
- all APIs must be documented with Swagger
- infrastructure must be reproducible with Dockerized resources
- environment configuration must be explicit and documented
- project should be ready for extension after the MVP

---

## 19. Decision summary

Mandatory decisions for this project:

- NestJS monorepo
- synchronous REST only
- JWT auth
- PostgreSQL
- Dockerized resources
- one API Gateway
- one database per service logically separated
- UUID primary keys
- consistent response and error format
- service-to-service calls only when required
- no event-based communication in v1

---

## 20. Documents that must be used with this file

This file must be read together with:

- `API_CONTRACTS.md`
- `DATA_SCHEMAS.md`
- `API_GATEWAY.md`
- `AUTH_ARCHITECTURE.md`
- `services/AUTH_SERVICE.md`
- `services/MEMBER_SERVICE.md`
- `services/CATEGORY_SERVICE.md`
- `services/BOOK_SERVICE.md`
- `services/BORROW_SERVICE.md`
- `services/FINE_PAYMENT_SERVICE.md`

