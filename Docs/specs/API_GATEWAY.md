# API Gateway Specification

## 1. Purpose

The API Gateway is the single public entry point for the Library Management System. Clients should call the gateway instead of calling individual services directly in normal usage.

The gateway exists to:

- hide multiple internal service ports from clients
- centralize authentication and authorization entry checks
- standardize request logging and correlation IDs
- centralize CORS, error normalization, and forwarding behavior
- simplify future additions like rate limiting or request metrics

---

## 2. Gateway scope

### 2.1 Responsibilities

- accept all external HTTP traffic
- route requests to downstream services
- verify JWT for protected routes
- add trusted user context headers for downstream services
- propagate correlation IDs
- normalize downstream service errors into a consistent client-facing format where feasible
- expose a health endpoint

### 2.2 What the gateway should not do

- it should not contain domain business logic for books, members, borrows, or fines
- it should not directly access any service database
- it should not become an orchestration engine for complex workflows
- it should not duplicate downstream service validation rules

---

## 3. Route mapping

Public route map:

- `/auth/**` -> `auth-service`
- `/members/**` -> `member-service`
- `/categories/**` -> `category-service`
- `/books/**` -> `book-service`
- `/borrows/**` -> `borrow-service`
- `/fines/**` -> `fine-payment-service`

Gateway should preserve method, path suffix, query params, and request body.

Example:

- `POST /books` on gateway forwards to `POST /books` on Book Service
- `GET /borrows?page=1&limit=10` forwards unchanged to Borrow Service

---

## 4. Authentication behavior

### 4.1 Public routes

Suggested public routes:

- `POST /auth/register`
- `POST /auth/login`
- `GET /health`

Everything else should be treated as protected by default unless the project explicitly decides otherwise.

### 4.2 Token verification strategy

Recommended approach for MVP:

- gateway verifies JWT itself using shared secret from Auth Service config contract
- gateway extracts user claims
- gateway forwards trusted headers to downstream services

Alternative approach:

- gateway calls Auth Service `/auth/validate`

For this project, local JWT verification in the gateway is simpler and faster.

### 4.3 Forwarded headers

Gateway should set:

- `x-user-id`
- `x-user-role`
- `x-username`
- `x-correlation-id`

If request already contains `x-correlation-id`, propagate it. Otherwise generate one.

---

## 5. Authorization behavior

Authorization should be handled in two layers.

### 5.1 Gateway layer

Gateway checks presence and validity of JWT for protected routes.

### 5.2 Downstream layer

Downstream services should still protect role-restricted endpoints because defense in depth is good practice.

Recommended role rules:

- `ADMIN`: full access
- `LIBRARIAN`: all management operations except perhaps hard-delete or special admin-only routes
- `MEMBER`: not used heavily in MVP management flows

---

## 6. Error handling

Gateway should return clear errors when:

- token is missing
- token is invalid
- downstream service is unreachable
- downstream service times out

Suggested gateway-specific error codes:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `UPSTREAM_UNAVAILABLE`
- `UPSTREAM_TIMEOUT`
- `ROUTE_NOT_FOUND`

Example gateway timeout response:

```json
{
  "success": false,
  "message": "Downstream service timeout",
  "error": {
    "code": "UPSTREAM_TIMEOUT",
    "details": []
  }
}
```

---

## 7. Technical implementation notes for NestJS

Recommended implementation shape:

- config module for downstream base URLs and auth settings
- auth middleware or guard for protected routes
- proxy service or route-specific forwarding logic
- request logging interceptor or middleware
- correlation ID middleware
- health controller

Possible tools:

- NestJS `HttpModule` with Axios
- low-level proxy middleware if preferred

For clarity and testability, explicit forwarding logic is often easier than opaque proxy magic.

---

## 8. Environment variables

Gateway should support:

- `PORT=3000`
- `NODE_ENV`
- `SERVICE_NAME=api-gateway`
- `JWT_SECRET`
- `AUTH_SERVICE_BASE_URL`
- `MEMBER_SERVICE_BASE_URL`
- `CATEGORY_SERVICE_BASE_URL`
- `BOOK_SERVICE_BASE_URL`
- `BORROW_SERVICE_BASE_URL`
- `FINE_PAYMENT_SERVICE_BASE_URL`
- `LOG_LEVEL`
- `CORS_ALLOWED_ORIGINS`

---

## 9. Health endpoints

Gateway should expose:

- `GET /health`

Response example:

```json
{
  "success": true,
  "message": "Gateway healthy",
  "data": {
    "service": "api-gateway",
    "status": "UP",
    "timestamp": "2026-03-27T10:00:00.000Z"
  }
}
```

Optional future enhancement:

- gateway dependency summary endpoint that pings downstream health routes

---

## 10. Logging requirements

The gateway should log:

- request method and path
- response status code
- latency
- authenticated user ID and role if present
- correlation ID
- downstream target service and result

Sensitive data such as passwords and tokens must not be logged.

---

## 11. Swagger considerations

The gateway may either:

- expose only its own operational docs, or
- document routed endpoints, or
- link to service-specific Swagger pages

For this project, service docs are mandatory. Gateway-level aggregation is optional.

---

## 12. Testing expectations

Gateway must be tested for:

- route forwarding correctness
- protected route blocking without token
- role-based protection behavior where implemented
- preserved query parameters and request body forwarding
- correlation ID presence
- downstream failure translation

---

## 13. Final rule

The API Gateway is an entry point and policy layer, not a business logic layer.

