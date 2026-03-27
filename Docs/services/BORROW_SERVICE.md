# Borrow Service Specification

## 1. Purpose

Borrow Service manages borrow transactions and return processing.

This is the main coordination service in the library domain because it interacts with Member Service, Book Service, and Fine Payment Service.

---

## 2. Boundaries

Borrow Service owns:

- borrow creation
- borrow status tracking
- return processing
- overdue calculation
- fine generation trigger

It does not own:

- member records
- book records
- fine storage

---

## 3. Core responsibilities

- create borrow record after validating member and book
- return book and update borrow status
- determine overdue status
- call Fine Payment Service when overdue fine must be created

---

## 4. Data model

Primary table:

- `borrows`

Important fields:

- `memberId`
- `bookId`
- `borrowDate`
- `dueDate`
- `returnDate`
- `status`
- `fineGenerated`
- `createdByUserId`
- `returnedByUserId`

---

## 5. API endpoints

- `POST /borrows`
- `GET /borrows`
- `GET /borrows/:borrowId`
- `POST /borrows/:borrowId/return`
- `PUT /borrows/:borrowId`
- `GET /borrows/:borrowId/overdue-status`
- `GET /borrows/health`

---

## 6. Service-to-service communication

Borrow Service communicates with:

### 6.1 Member Service

For:

- member existence validation
- eligibility validation

### 6.2 Book Service

For:

- book existence and availability validation
- decrement inventory on borrow
- increment inventory on return

### 6.3 Fine Payment Service

For:

- fine creation after overdue return

Borrow Service must not access other service databases directly.

---

## 7. Borrow workflow rules

### 7.1 Create borrow

Rules:

- member must exist
- member must be eligible
- book must exist
- book must be available
- dueDate must be >= borrowDate
- on successful borrow, decrement book inventory

### 7.2 Return book

Rules:

- borrow must exist
- borrow must not already be returned
- set returnDate and status
- increment book inventory
- if overdue, compute fine and call Fine Payment Service
- set `fineGenerated` true if fine was created

---

## 8. Suggested module structure

```text
src/
  borrows/
    borrows.controller.ts
    borrows.service.ts
    borrows.module.ts
    dto/
      create-borrow.dto.ts
      return-book.dto.ts
      update-borrow.dto.ts
      list-borrows.query.dto.ts
  integrations/
    member.client.ts
    book.client.ts
    fine.client.ts
  prisma/
    prisma.service.ts
  health/
    health.controller.ts
  main.ts
```

---

## 9. Environment variables

- `PORT=3005`
- `SERVICE_NAME=borrow-service`
- `DATABASE_URL`
- `MEMBER_SERVICE_BASE_URL`
- `BOOK_SERVICE_BASE_URL`
- `FINE_PAYMENT_SERVICE_BASE_URL`
- `NODE_ENV`

---

## 10. Failure handling guidance

Important because multi-step flows exist.

### 10.1 Borrow create failure after inventory decrement

Preferred approach:

- create borrow and decrement inventory in carefully ordered logic
- if inventory decrement fails, borrow creation must not complete
- if borrow creation succeeds but downstream inventory update fails unexpectedly, compensate or roll back before returning success

For MVP, implement predictable ordering and local error handling carefully.

### 10.2 Return flow failure after borrow update

If borrow is marked returned but inventory increment fails, the service must not silently succeed. Prefer wrapping local DB update and downstream call handling in a safe sequence and returning a clear error.

This project does not require distributed transaction infrastructure, but logic must still be careful.

---

## 11. Testing expectations

Must test:

- successful borrow
- borrow rejection for blocked member
- borrow rejection for unavailable book
- successful return without fine
- successful return with fine generation
- duplicate return rejection
- overdue status endpoint

---

## 12. Notes for Codex agent

- this is the main coordinator service
- keep business logic explicit and readable
- do not introduce event-based patterns in v1
- downstream client wrappers should be well isolated for testability

