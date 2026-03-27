# Library System Microservices - API Contracts

## 1. Purpose of this document

This document defines the API contracts for all services in the Library Management System. It is written as the implementation contract for backend development, gateway routing, Swagger generation, and testing.

All services use JSON over HTTP.

All successful responses follow the common response shape unless a special case is explicitly documented.

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

All error responses follow this shape:

```json
{
  "success": false,
  "message": "Human readable summary",
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "details": []
  }
}
```

Authentication is via `Authorization: Bearer <token>` where required.

---

## 2. Auth Service API Contracts

Base path:

- direct: `/auth`
- via gateway: `/auth`

### 2.1 POST /auth/register

Creates a new auth user.

Access:

- open for MVP, or restricted to admins if the project later separates public registration from staff onboarding

Request body:

```json
{
  "username": "librarian01",
  "email": "librarian01@example.com",
  "password": "StrongPassword123",
  "role": "LIBRARIAN"
}
```

Validation:

- `username` required, 3 to 50 chars, unique
- `email` required, valid email, unique
- `password` required, minimum 8 chars
- `role` required, enum `ADMIN | LIBRARIAN | MEMBER`

Success response `201`:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "username": "librarian01",
    "email": "librarian01@example.com",
    "role": "LIBRARIAN",
    "createdAt": "2026-03-27T10:00:00.000Z"
  }
}
```

Possible errors:

- `409 USERNAME_ALREADY_EXISTS`
- `409 EMAIL_ALREADY_EXISTS`
- `400 VALIDATION_ERROR`

### 2.2 POST /auth/login

Authenticates a user and returns a JWT.

Access:

- open

Request body:

```json
{
  "login": "librarian01@example.com",
  "password": "StrongPassword123"
}
```

Notes:

- `login` may be username or email

Success response `200`:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt-token",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "username": "librarian01",
      "email": "librarian01@example.com",
      "role": "LIBRARIAN"
    }
  }
}
```

Possible errors:

- `401 INVALID_CREDENTIALS`
- `403 USER_INACTIVE`

### 2.3 GET /auth/profile

Returns the authenticated user profile.

Access:

- authenticated

Headers:

- bearer token required

Success response `200`:

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "username": "librarian01",
    "email": "librarian01@example.com",
    "role": "LIBRARIAN",
    "status": "ACTIVE"
  }
}
```

### 2.4 POST /auth/validate

Validates a token or returns auth context.

Access:

- internal use by gateway or services

Request body:

```json
{
  "token": "jwt-token"
}
```

Success response `200`:

```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "valid": true,
    "user": {
      "id": "uuid",
      "username": "librarian01",
      "role": "LIBRARIAN"
    }
  }
}
```

### 2.5 GET /auth/health

Service health endpoint.

---

## 3. Member Service API Contracts

Base path:

- direct: `/members`
- via gateway: `/members`

### 3.1 POST /members

Creates a member profile.

Access:

- `ADMIN`, `LIBRARIAN`

Request body:

```json
{
  "fullName": "Nimal Perera",
  "email": "nimal@example.com",
  "phone": "+94771234567",
  "address": "Colombo",
  "membershipStatus": "ACTIVE"
}
```

Validation:

- `fullName` required
- `email` optional or required depending on chosen policy, must be unique if present
- `membershipStatus` enum `ACTIVE | INACTIVE | BLOCKED`

Success response `201`:

```json
{
  "success": true,
  "message": "Member created successfully",
  "data": {
    "id": "uuid",
    "fullName": "Nimal Perera",
    "membershipStatus": "ACTIVE"
  }
}
```

### 3.2 GET /members

Lists members with pagination and optional filters.

Access:

- `ADMIN`, `LIBRARIAN`

Query params:

- `page`
- `limit`
- `search`
- `membershipStatus`

Success response `200`:

```json
{
  "success": true,
  "message": "Members retrieved successfully",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 0,
      "totalPages": 0
    }
  }
}
```

### 3.3 GET /members/:memberId

Returns member by ID.

Access:

- `ADMIN`, `LIBRARIAN`

### 3.4 PUT /members/:memberId

Updates member fields.

Access:

- `ADMIN`, `LIBRARIAN`

Request body may include:

```json
{
  "fullName": "Updated Name",
  "phone": "+94770000000",
  "membershipStatus": "BLOCKED"
}
```

### 3.5 DELETE /members/:memberId

Soft deletes or deactivates a member.

Access:

- `ADMIN`

Behavior:

- prefer setting `deletedAt` and/or status change instead of hard delete

### 3.6 GET /members/:memberId/eligibility

Internal convenience endpoint for Borrow Service.

Access:

- internal or `ADMIN`, `LIBRARIAN`

Response example:

```json
{
  "success": true,
  "message": "Member eligibility checked successfully",
  "data": {
    "memberId": "uuid",
    "exists": true,
    "eligibleToBorrow": true,
    "membershipStatus": "ACTIVE"
  }
}
```

### 3.7 GET /members/health

Service health endpoint.

---

## 4. Category Service API Contracts

Base path:

- direct: `/categories`
- via gateway: `/categories`

### 4.1 POST /categories

Creates a category.

Access:

- `ADMIN`, `LIBRARIAN`

Request body:

```json
{
  "name": "Computer Science",
  "description": "Books related to computing and software"
}
```

Validation:

- `name` required, unique among active categories

### 4.2 GET /categories

Lists categories.

Access:

- authenticated or public depending on policy

### 4.3 GET /categories/:categoryId

Returns category details.

### 4.4 PUT /categories/:categoryId

Updates category fields.

### 4.5 DELETE /categories/:categoryId

Soft deletes category.

Access:

- `ADMIN`

### 4.6 GET /categories/:categoryId/existence

Internal convenience endpoint.

Response:

```json
{
  "success": true,
  "message": "Category checked successfully",
  "data": {
    "categoryId": "uuid",
    "exists": true,
    "active": true
  }
}
```

### 4.7 GET /categories/health

Service health endpoint.

---

## 5. Book Service API Contracts

Base path:

- direct: `/books`
- via gateway: `/books`

### 5.1 POST /books

Creates a book.

Access:

- `ADMIN`, `LIBRARIAN`

Request body:

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "publishedYear": 2008,
  "categoryId": "uuid",
  "totalCopies": 5,
  "availableCopies": 5,
  "status": "ACTIVE"
}
```

Validation:

- title required
- author required
- ISBN unique if provided
- categoryId required if categories are mandatory
- totalCopies >= 0
- availableCopies >= 0
- availableCopies <= totalCopies

### 5.2 GET /books

Lists books with filters.

Query params:

- `page`
- `limit`
- `search`
- `categoryId`
- `status`
- `availableOnly`

### 5.3 GET /books/:bookId

Returns a book.

### 5.4 PUT /books/:bookId

Updates a book.

Request body may include:

```json
{
  "title": "Clean Code 2nd Edition",
  "totalCopies": 6,
  "availableCopies": 4,
  "status": "ACTIVE"
}
```

### 5.5 DELETE /books/:bookId

Soft deletes a book.

Access:

- `ADMIN`

### 5.6 GET /books/:bookId/availability

Internal convenience endpoint for Borrow Service.

Response example:

```json
{
  "success": true,
  "message": "Book availability checked successfully",
  "data": {
    "bookId": "uuid",
    "exists": true,
    "available": true,
    "availableCopies": 3,
    "status": "ACTIVE"
  }
}
```

### 5.7 POST /books/:bookId/inventory/decrement

Internal endpoint used by Borrow Service when borrow succeeds.

Request body:

```json
{
  "reason": "BORROW_CREATED",
  "quantity": 1,
  "referenceId": "borrow-uuid"
}
```

Behavior:

- decrement `availableCopies` atomically
- fail if insufficient copies

### 5.8 POST /books/:bookId/inventory/increment

Internal endpoint used by Borrow Service when return succeeds.

Request body:

```json
{
  "reason": "BOOK_RETURNED",
  "quantity": 1,
  "referenceId": "borrow-uuid"
}
```

Behavior:

- increment `availableCopies`
- must not exceed `totalCopies`

### 5.9 GET /books/health

Service health endpoint.

---

## 6. Borrow Service API Contracts

Base path:

- direct: `/borrows`
- via gateway: `/borrows`

### 6.1 POST /borrows

Creates a borrow record.

Access:

- `ADMIN`, `LIBRARIAN`

Request body:

```json
{
  "memberId": "uuid",
  "bookId": "uuid",
  "borrowDate": "2026-03-27",
  "dueDate": "2026-04-03"
}
```

Processing rules:

- validate member eligibility through Member Service
- validate book availability through Book Service
- create borrow record with status `BORROWED`
- decrement book inventory via Book Service

Success response `201`:

```json
{
  "success": true,
  "message": "Borrow record created successfully",
  "data": {
    "id": "borrow-uuid",
    "memberId": "uuid",
    "bookId": "uuid",
    "borrowDate": "2026-03-27",
    "dueDate": "2026-04-03",
    "status": "BORROWED"
  }
}
```

Errors:

- `400 VALIDATION_ERROR`
- `404 MEMBER_NOT_FOUND`
- `403 MEMBER_NOT_ELIGIBLE`
- `404 BOOK_NOT_FOUND`
- `409 BOOK_NOT_AVAILABLE`

### 6.2 GET /borrows

Lists borrow records.

Query params:

- `page`
- `limit`
- `memberId`
- `bookId`
- `status`
- `overdueOnly`

### 6.3 GET /borrows/:borrowId

Returns a borrow record.

### 6.4 POST /borrows/:borrowId/return

Processes a return.

Access:

- `ADMIN`, `LIBRARIAN`

Request body:

```json
{
  "returnDate": "2026-04-10"
}
```

Processing rules:

- borrow record must exist
- borrow record must not already be returned
- set status `RETURNED`
- set `returnDate`
- increment book inventory via Book Service
- if overdue, compute fine and call Fine Payment Service

Success response `200`:

```json
{
  "success": true,
  "message": "Book returned successfully",
  "data": {
    "borrowId": "borrow-uuid",
    "status": "RETURNED",
    "returnDate": "2026-04-10",
    "fineGenerated": true,
    "fineId": "fine-uuid"
  }
}
```

### 6.5 PUT /borrows/:borrowId

Optional limited update endpoint.

Use only for fields such as due date before return if business policy allows.

### 6.6 GET /borrows/:borrowId/overdue-status

Returns overdue information.

Response example:

```json
{
  "success": true,
  "message": "Overdue status checked successfully",
  "data": {
    "borrowId": "borrow-uuid",
    "overdue": true,
    "daysOverdue": 7
  }
}
```

### 6.7 GET /borrows/health

Service health endpoint.

---

## 7. Fine Payment Service API Contracts

Base path:

- direct: `/fines`
- via gateway: `/fines`

### 7.1 POST /fines

Creates a fine record.

Access:

- internal from Borrow Service or `ADMIN`, `LIBRARIAN`

Request body:

```json
{
  "memberId": "uuid",
  "borrowId": "borrow-uuid",
  "amount": 500,
  "reason": "OVERDUE_RETURN",
  "status": "PENDING"
}
```

Rules:

- one active fine per overdue borrow record unless future policy changes

Success response `201`:

```json
{
  "success": true,
  "message": "Fine created successfully",
  "data": {
    "id": "fine-uuid",
    "memberId": "uuid",
    "borrowId": "borrow-uuid",
    "amount": 500,
    "status": "PENDING"
  }
}
```

### 7.2 GET /fines

Lists fine records.

Query params:

- `page`
- `limit`
- `memberId`
- `borrowId`
- `status`

### 7.3 GET /fines/:fineId

Returns a fine record.

### 7.4 POST /fines/:fineId/payments

Records a payment for a fine.

Access:

- `ADMIN`, `LIBRARIAN`

Request body:

```json
{
  "amount": 500,
  "paymentMethod": "CASH",
  "paymentDate": "2026-04-10"
}
```

Validation:

- amount required
- payment method enum `CASH | CARD | ONLINE`
- for MVP, amount must equal outstanding fine amount

Success response `201`:

```json
{
  "success": true,
  "message": "Fine payment recorded successfully",
  "data": {
    "paymentId": "payment-uuid",
    "fineId": "fine-uuid",
    "amount": 500,
    "paymentMethod": "CASH",
    "paymentDate": "2026-04-10",
    "fineStatus": "PAID"
  }
}
```

### 7.5 GET /fines/borrow/:borrowId

Returns fine by borrow record.

Useful for Borrow Service and UI flows.

### 7.6 GET /fines/member/:memberId

Returns fines for a member.

### 7.7 GET /fines/health

Service health endpoint.

---

## 8. API Gateway Contracts

The gateway routes the following public paths:

- `/auth/**` -> Auth Service
- `/members/**` -> Member Service
- `/categories/**` -> Category Service
- `/books/**` -> Book Service
- `/borrows/**` -> Borrow Service
- `/fines/**` -> Fine Payment Service

### 8.1 GET /health

Gateway health endpoint.

### 8.2 Authentication behavior

Protected routes require a valid bearer token.

Suggested public routes:

- `POST /auth/register`
- `POST /auth/login`
- `GET /health`

Suggested protected routes:

- all member management routes
- all category management routes
- all book management routes
- all borrow routes
- all fine routes
- `GET /auth/profile`

### 8.3 Gateway headers

Gateway should add or propagate:

- `x-correlation-id`
- `x-user-id`
- `x-user-role`
- `x-username`

---

## 9. Common status codes

Recommended usage across services:

- `200 OK`
- `201 Created`
- `204 No Content` only if response body is intentionally empty
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity` optional if preferred for business rule failure, but keep usage consistent
- `500 Internal Server Error`

---

## 10. Domain enums

### 10.1 Auth role

- `ADMIN`
- `LIBRARIAN`
- `MEMBER`

### 10.2 Auth user status

- `ACTIVE`
- `INACTIVE`
- `LOCKED`

### 10.3 Member status

- `ACTIVE`
- `INACTIVE`
- `BLOCKED`

### 10.4 Book status

- `ACTIVE`
- `INACTIVE`
- `ARCHIVED`

### 10.5 Borrow status

- `BORROWED`
- `RETURNED`
- `OVERDUE`
- `CANCELLED`

For implementation, `OVERDUE` can be a derived state or stored state. Derived state is cleaner for MVP.

### 10.6 Fine status

- `PENDING`
- `PAID`
- `WAIVED`

### 10.7 Payment method

- `CASH`
- `CARD`
- `ONLINE`

---

## 11. Endpoint summary matrix

| Service | Method | Path | Purpose |
|---|---|---|---|
| Auth | POST | /auth/register | register user |
| Auth | POST | /auth/login | login |
| Auth | GET | /auth/profile | get current profile |
| Auth | POST | /auth/validate | validate token |
| Member | POST | /members | create member |
| Member | GET | /members | list members |
| Member | GET | /members/:id | get member |
| Member | PUT | /members/:id | update member |
| Member | DELETE | /members/:id | deactivate member |
| Member | GET | /members/:id/eligibility | check borrow eligibility |
| Category | POST | /categories | create category |
| Category | GET | /categories | list categories |
| Category | GET | /categories/:id | get category |
| Category | PUT | /categories/:id | update category |
| Category | DELETE | /categories/:id | deactivate category |
| Category | GET | /categories/:id/existence | check category |
| Book | POST | /books | create book |
| Book | GET | /books | list books |
| Book | GET | /books/:id | get book |
| Book | PUT | /books/:id | update book |
| Book | DELETE | /books/:id | deactivate book |
| Book | GET | /books/:id/availability | check availability |
| Book | POST | /books/:id/inventory/decrement | decrement copies |
| Book | POST | /books/:id/inventory/increment | increment copies |
| Borrow | POST | /borrows | create borrow |
| Borrow | GET | /borrows | list borrows |
| Borrow | GET | /borrows/:id | get borrow |
| Borrow | POST | /borrows/:id/return | return book |
| Borrow | PUT | /borrows/:id | limited update |
| Borrow | GET | /borrows/:id/overdue-status | check overdue |
| Fine | POST | /fines | create fine |
| Fine | GET | /fines | list fines |
| Fine | GET | /fines/:id | get fine |
| Fine | POST | /fines/:id/payments | record payment |
| Fine | GET | /fines/borrow/:borrowId | get fine by borrow |
| Fine | GET | /fines/member/:memberId | get member fines |

