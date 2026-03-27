# Auth Service Specification

## 1. Purpose

Auth Service is responsible for authentication and authorization support for the Library Management System.

It manages:

- account registration
- credential verification
- JWT token issuance
- auth user profile retrieval
- user roles and account status

It does not manage library member business data.

---

## 2. Boundaries

Auth Service owns only auth-related user accounts and credentials.

It must not own:

- library member profiles
- books
- categories
- borrows
- fines

A library member is a business entity in Member Service, not an auth account by default.

---

## 3. Core responsibilities

- register users
- login users
- hash passwords securely
- issue JWT access tokens
- return current auth profile
- optionally validate tokens for internal use
- expose health endpoint

---

## 4. Data model

Primary table:

- `auth_users`

Fields:

- `id`
- `username`
- `email`
- `passwordHash`
- `role`
- `status`
- `lastLoginAt`
- `createdAt`
- `updatedAt`
- `deletedAt`

See `DATA_SCHEMAS.md` for the full schema definition.

---

## 5. API endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile`
- `POST /auth/validate`
- `GET /auth/health`

See `API_CONTRACTS.md` for full request and response contracts.

---

## 6. Business rules

- username must be unique
- email must be unique
- password must be hashed
- only active users can authenticate
- role must be one of `ADMIN`, `LIBRARIAN`, `MEMBER`
- password hash must never be returned to clients

---

## 7. Security requirements

- use bcrypt or argon2
- keep `JWT_SECRET` in environment variables
- never log passwords or password hashes
- return generic credential errors
- support bearer authentication for protected routes

---

## 8. Inter-service communication

Auth Service is mostly standalone.

Main interactions:

- API Gateway may verify JWT locally or call Auth Service validate endpoint
- other services generally do not need to call Auth Service directly in MVP

Preferred design:

- Gateway validates token
- Gateway forwards user context headers to downstream services

---

## 9. Suggested module structure

Recommended source structure:

```text
src/
  auth/
    auth.controller.ts
    auth.service.ts
    auth.module.ts
    dto/
      register.dto.ts
      login.dto.ts
      validate-token.dto.ts
  users/
    users.repository.ts
    users.service.ts
  common/
    enums/
    interfaces/
  prisma/
    prisma.service.ts
  health/
    health.controller.ts
  main.ts
```

---

## 10. Environment variables

Required:

- `PORT=3001`
- `SERVICE_NAME=auth-service`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN=1h`
- `NODE_ENV`

---

## 11. Validation requirements

Register DTO:

- username required
- email required and valid
- password required with minimum length
- role required and valid enum

Login DTO:

- login required
- password required

---

## 12. Error cases

- duplicate username
- duplicate email
- invalid credentials
- inactive or locked user
- invalid or expired token

---

## 13. Testing expectations

Must test:

- successful registration
- duplicate registration failure
- successful login
- failed login
- profile access with token
- token validation behavior

---

## 14. Swagger expectations

Expose docs at `/docs`.

Document:

- request schemas
- bearer auth usage
- success responses
- error responses

---

## 15. Notes for Codex agent

Important implementation notes:

- auth user is not the same as library member
- prefer local JWT verification in gateway for performance and simplicity
- keep Auth Service focused and small
- avoid refresh token complexity in v1

