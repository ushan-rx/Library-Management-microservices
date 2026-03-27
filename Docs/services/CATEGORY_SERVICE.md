# Category Service Specification

## 1. Purpose

Category Service manages book categories used to classify the library catalog.

---

## 2. Boundaries

Category Service owns:

- category creation
- category updates
- category deactivation
- category lookup

It does not own books themselves.

---

## 3. Core responsibilities

- create category
- list categories
- get category by ID
- update category
- deactivate category
- expose category existence endpoint for validation

---

## 4. Data model

Primary table:

- `categories`

Fields:

- `id`
- `name`
- `description`
- `status`
- timestamps and soft delete fields

---

## 5. API endpoints

- `POST /categories`
- `GET /categories`
- `GET /categories/:categoryId`
- `PUT /categories/:categoryId`
- `DELETE /categories/:categoryId`
- `GET /categories/:categoryId/existence`
- `GET /categories/health`

---

## 6. Business rules

- category name should be unique among active categories
- soft delete preferred over hard delete
- deactivated categories should remain valid historically for existing books

---

## 7. Inter-service communication

Book Service may call Category Service to validate `categoryId` during create or update operations.

Category Service should remain otherwise standalone.

---

## 8. Suggested module structure

```text
src/
  categories/
    categories.controller.ts
    categories.service.ts
    categories.module.ts
    dto/
      create-category.dto.ts
      update-category.dto.ts
      list-categories.query.dto.ts
  prisma/
    prisma.service.ts
  health/
    health.controller.ts
  main.ts
```

---

## 9. Environment variables

- `PORT=3004`
- `SERVICE_NAME=category-service`
- `DATABASE_URL`
- `NODE_ENV`

---

## 10. Testing expectations

Must test:

- create category
- duplicate category rejection
- update category
- deactivate category
- existence endpoint

---

## 11. Notes for Codex agent

- category validation should happen at write time in Book Service, not constantly during all reads
- keep category service lightweight

