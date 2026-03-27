# Fine Payment Service Specification

## 1. Purpose

Fine Payment Service manages fine records and fine payment records.

---

## 2. Boundaries

Fine Payment Service owns:

- fine creation
- fine lookup
- fine payment recording
- fine status updates

It does not own borrow processing or member data.

---

## 3. Core responsibilities

- create fine
- list fines
- get fine by ID
- record payment for a fine
- look up fines by member or borrow record

---

## 4. Data model

Primary tables:

- `fines`
- `fine_payments`

Important fine fields:

- `memberId`
- `borrowId`
- `amount`
- `reason`
- `status`
- `issuedDate`
- `paidDate`

Important payment fields:

- `fineId`
- `amount`
- `paymentMethod`
- `paymentDate`
- `transactionReference`
- `recordedByUserId`

---

## 5. API endpoints

- `POST /fines`
- `GET /fines`
- `GET /fines/:fineId`
- `POST /fines/:fineId/payments`
- `GET /fines/borrow/:borrowId`
- `GET /fines/member/:memberId`
- `GET /fines/health`

---

## 6. Business rules

- one active fine per borrow in MVP
- amount must be non-negative
- payment amount must match outstanding amount in MVP
- when fine is paid, update fine status to `PAID`
- waiving logic is optional and can be added later

---

## 7. Inter-service communication

Fine Payment Service is mostly standalone.

Borrow Service may call it to create a fine.

Fine Payment Service should not call Borrow Service or Member Service in normal MVP flow.

---

## 8. Suggested module structure

```text
src/
  fines/
    fines.controller.ts
    fines.service.ts
    fines.module.ts
    dto/
      create-fine.dto.ts
      record-fine-payment.dto.ts
      list-fines.query.dto.ts
  prisma/
    prisma.service.ts
  health/
    health.controller.ts
  main.ts
```

---

## 9. Environment variables

- `PORT=3006`
- `SERVICE_NAME=fine-payment-service`
- `DATABASE_URL`
- `NODE_ENV`

---

## 10. Testing expectations

Must test:

- fine creation
- duplicate fine prevention for same borrow
- fine payment recording
- fine status updated to paid
- fine lookup by borrow
- fine lookup by member

---

## 11. Notes for Codex agent

- keep payments and fines in same service database
- avoid overengineering partial payment support in v1
- financial records should not be hard deleted in normal flows

