# Book Service Specification

## 1. Purpose

Book Service manages the library catalog and inventory state.

---

## 2. Boundaries

Book Service owns:

- book catalog records
- inventory counts
- inventory adjustment history
- book availability validation

It does not own categories, borrows, or fines.

---

## 3. Core responsibilities

- create book
- list books
- get book by ID
- update book
- deactivate book
- expose book availability check
- decrement inventory for borrow
- increment inventory for return
- record inventory adjustments

---

## 4. Data model

Primary tables:

- `books`
- `book_inventory_adjustments`

Important fields:

- `title`
- `author`
- `isbn`
- `publishedYear`
- `categoryId`
- `totalCopies`
- `availableCopies`
- `status`

Inventory adjustments fields:

- `bookId`
- `adjustmentType`
- `quantity`
- `reason`
- `referenceId`

---

## 5. API endpoints

- `POST /books`
- `GET /books`
- `GET /books/:bookId`
- `PUT /books/:bookId`
- `DELETE /books/:bookId`
- `GET /books/:bookId/availability`
- `POST /books/:bookId/inventory/decrement`
- `POST /books/:bookId/inventory/increment`
- `GET /books/health`

---

## 6. Business rules

- title required
- author required
- ISBN unique if provided
- `totalCopies >= 0`
- `availableCopies >= 0`
- `availableCopies <= totalCopies`
- inactive or archived books are not borrowable
- inventory changes must be atomic

---

## 7. Inter-service communication

Book Service may call Category Service on create or update to validate category existence.

Borrow Service will call Book Service to:

- verify availability
- decrement copies on borrow
- increment copies on return

Book Service should not call Borrow Service.

---

## 8. Suggested module structure

```text
src/
  books/
    books.controller.ts
    books.service.ts
    books.module.ts
    dto/
      create-book.dto.ts
      update-book.dto.ts
      list-books.query.dto.ts
      inventory-adjust.dto.ts
  inventory/
    inventory.service.ts
  prisma/
    prisma.service.ts
  integrations/
    category.client.ts
  health/
    health.controller.ts
  main.ts
```

---

## 9. Environment variables

- `PORT=3003`
- `SERVICE_NAME=book-service`
- `DATABASE_URL`
- `CATEGORY_SERVICE_BASE_URL`
- `NODE_ENV`

---

## 10. Testing expectations

Must test:

- create book
- invalid category rejection if validation enabled
- availability endpoint
- decrement inventory success and failure
- increment inventory success
- consistency of adjustment log entries

---

## 11. Notes for Codex agent

- inventory operations should use transactions
- do not allow availableCopies to drift out of bounds
- category is an external reference, not DB relation

