# Member Service Specification

## 1. Purpose

Member Service manages library member business records.

It stores the profiles of people who can borrow books from the library.

---

## 2. Boundaries

Member Service owns:

- member creation
- member profile updates
- member status management
- eligibility support for borrowing

It does not own:

- auth credentials
- books
- categories
- borrow records
- fine records

---

## 3. Core responsibilities

- create member
- list members
- get member by ID
- update member
- deactivate or soft delete member
- expose member borrow eligibility check

---

## 4. Data model

Primary table:

- `members`

Key fields:

- `id`
- `fullName`
- `email`
- `phone`
- `address`
- `membershipStatus`
- `notes`
- timestamps and soft delete fields

Membership statuses:

- `ACTIVE`
- `INACTIVE`
- `BLOCKED`

---

## 5. API endpoints

- `POST /members`
- `GET /members`
- `GET /members/:memberId`
- `PUT /members/:memberId`
- `DELETE /members/:memberId`
- `GET /members/:memberId/eligibility`
- `GET /members/health`

---

## 6. Business rules

- only active members may borrow
- blocked members may not borrow
- inactive members may not borrow
- member email should be unique if present
- soft delete preferred over hard delete

---

## 7. Inter-service communication

Member Service is mostly standalone.

Borrow Service may call:

- `GET /members/:memberId`
- `GET /members/:memberId/eligibility`

Member Service should not call other services for normal operation.

---

## 8. Suggested module structure

```text
src/
  members/
    members.controller.ts
    members.service.ts
    members.module.ts
    dto/
      create-member.dto.ts
      update-member.dto.ts
      list-members.query.dto.ts
  prisma/
    prisma.service.ts
  health/
    health.controller.ts
  main.ts
```

---

## 9. Environment variables

- `PORT=3002`
- `SERVICE_NAME=member-service`
- `DATABASE_URL`
- `NODE_ENV`

---

## 10. Validation requirements

Create member:

- fullName required
- membershipStatus required
- email must be valid if provided

Update member:

- partial update allowed
- membershipStatus must be enum if provided

---

## 11. Testing expectations

Must test:

- create member
- list members with filters
- update member status
- blocked member eligibility
- soft delete behavior

---

## 12. Notes for Codex agent

- member entity is independent from auth user entity
- eligibility endpoint should be optimized for Borrow Service
- keep status logic simple and explicit

