# Authentication and Authorization Architecture

## 1. Purpose

This document defines how authentication and authorization should work across the Library Management System.

---

## 2. Auth model summary

The system uses:

- username/email + password authentication
- password hashing with bcrypt or argon2
- JWT access tokens
- role-based access control
- gateway-level authentication enforcement
- optional downstream role guards

No OAuth, social login, refresh token rotation, or MFA is required for MVP.

---

## 3. Roles

Supported roles:

- `ADMIN`
- `LIBRARIAN`
- `MEMBER`

Role meanings:

### 3.1 ADMIN

Can:

- manage all services
- create users
- deactivate users
- manage categories, books, members, borrows, and fines
- access administrative operations

### 3.2 LIBRARIAN

Can:

- manage members
- manage categories
- manage books
- create borrows and process returns
- manage fine payments

### 3.3 MEMBER

Reserved for future member self-service use.

For MVP, member role may only access limited personal profile routes if such routes are added.

---

## 4. Authentication flow

### 4.1 Registration

1. client sends username, email, password, role to Auth Service
2. Auth Service validates uniqueness
3. Auth Service hashes password
4. Auth Service stores user in `auth_users`
5. Auth Service returns created user info

### 4.2 Login

1. client sends login credential and password
2. Auth Service verifies password hash
3. Auth Service creates JWT payload with:
   - `sub` user id
   - `username`
   - `email`
   - `role`
4. Auth Service returns access token and user summary

### 4.3 Accessing protected routes

1. client includes `Authorization: Bearer <token>`
2. gateway validates token
3. gateway forwards request and user context headers
4. downstream service authorizes based on forwarded role or revalidated token

---

## 5. JWT design

### 5.1 Token payload

Recommended JWT claims:

```json
{
  "sub": "user-uuid",
  "username": "admin01",
  "email": "admin@example.com",
  "role": "ADMIN",
  "iat": 1711536000,
  "exp": 1711539600
}
```

### 5.2 Token lifetime

Suggested default:

- access token: 1 hour

For MVP, this is enough.

### 5.3 Signing

Use a shared secret via environment variable:

- `JWT_SECRET`

If you later evolve to asymmetric signing, update both Auth Service and Gateway.

---

## 6. Password policy

Minimum policy:

- at least 8 characters
- must not be stored or logged in plaintext

Recommended stronger validation:

- at least one uppercase
- at least one lowercase
- at least one number

The exact strictness may be relaxed for academic demo, but secure hashing is mandatory.

---

## 7. Gateway and service auth relationship

### 7.1 Gateway as primary auth enforcement point

Gateway should:

- reject missing or invalid bearer tokens for protected routes
- decode token claims
- forward trusted user context headers

### 7.2 Downstream service trust model

Preferred MVP trust model:

- gateway validates token
- services trust requests that come from gateway and use forwarded auth headers

Optional stronger model:

- services can also validate JWT themselves

For the project, gateway validation plus service role checks is usually sufficient.

---

## 8. Role-based authorization matrix

| Route Area          | ADMIN | LIBRARIAN |         MEMBER |
| ------------------- | ----: | --------: | -------------: |
| Auth profile        |   yes |       yes |            yes |
| Create auth user    |   yes |  optional |             no |
| Manage members      |   yes |       yes |             no |
| Manage categories   |   yes |       yes |             no |
| Manage books        |   yes |       yes |             no |
| Create borrow       |   yes |       yes |             no |
| Process return      |   yes |       yes |             no |
| View fines          |   yes |       yes | limited future |
| Record fine payment |   yes |       yes |             no |

---

## 9. User status handling

Auth user status enum:

- `ACTIVE`
- `INACTIVE`
- `LOCKED`

Rules:

- only `ACTIVE` users can log in
- `LOCKED` users receive forbidden error
- `INACTIVE` users cannot authenticate

---

## 10. Member status vs auth user status

These are different concepts.

### 10.1 Auth user

Represents a system account that can log in.

### 10.2 Library member

Represents a person registered with the library business domain.

A library member record does not have to map one-to-one to an auth user in MVP.

This separation is important because:

- staff users log into the system
- member records are business entities used for borrowing

A future self-service feature could link a member record to an auth user, but that is not required now.

---

## 11. Auth endpoints and expectations

### 11.1 Register

- validate unique username and email
- hash password
- store user

### 11.2 Login

- find by email or username
- compare hash
- issue token
- update `lastLoginAt`

### 11.3 Profile

- return current authenticated user details

### 11.4 Validate token

- internal support endpoint if needed

---

## 12. Security rules

Mandatory:

- never log passwords
- never return password hashes
- sanitize auth error messages to avoid credential leakage
- keep JWT secret out of source control
- use environment variables for secrets

Recommended:

- use Nest validation pipe globally
- use rate limiting later if needed
- use HTTPS in production environments

---

## 13. Implementation notes for NestJS

Recommended modules inside Auth Service:

- `auth`
- `users`
- `security`

Recommended internal components:

- controller for auth endpoints
- service for business logic
- repository/data layer using Prisma
- password hashing helper
- JWT helper
- DTOs for register and login
- guards/decorators for protected profile route

Recommended shared components in `libs/auth`:

- JWT payload interface
- role enum
- auth decorators such as `@Roles()`
- gateway auth utilities if shared within monorepo

---

## 14. Error cases

Recommended auth error codes:

- `INVALID_CREDENTIALS`
- `USERNAME_ALREADY_EXISTS`
- `EMAIL_ALREADY_EXISTS`
- `USER_INACTIVE`
- `USER_LOCKED`
- `TOKEN_INVALID`
- `TOKEN_EXPIRED`
- `FORBIDDEN`

---

## 15. Seed users for demo

Recommended initial seed accounts:

### 15.1 Admin

- username: `admin`
- email: `admin@library.local`
- password: `Admin12345`
- role: `ADMIN`

### 15.2 Librarian

- username: `librarian`
- email: `librarian@library.local`
- password: `Librarian123`
- role: `LIBRARIAN`

These credentials are for local development only and must be documented in seed notes, not hardcoded in production code.

---

## 16. Auth decision summary

- JWT bearer auth
- shared secret for signing in MVP
- gateway verifies tokens
- services enforce role checks on sensitive endpoints
- auth users are separate from library members
- no event-based auth flows
- no refresh-token complexity unless later added intentionally
