# Library System Microservices - Data Schemas

## 1. Purpose of this document

This document defines the logical data schemas for each service. It is intentionally independent of a specific ORM implementation, but the structures are suitable for Prisma with PostgreSQL.

All IDs should use UUID.

All timestamps should be stored in UTC.

All tables should include `createdAt` and `updatedAt` unless there is a strong reason not to.

Where historical consistency matters, soft deletion is preferred using `deletedAt` instead of hard deletion.

---

## 2. Auth Service Schema

### 2.1 auth_users

Purpose:

Stores user accounts used for authentication and authorization.

Columns:

| Column | Type | Required | Notes |
|---|---|---:|---|
| id | uuid | yes | primary key |
| username | varchar(50) | yes | unique |
| email | varchar(255) | yes | unique |
| passwordHash | varchar(255) | yes | bcrypt or argon2 hash |
| role | varchar(20) | yes | ADMIN, LIBRARIAN, MEMBER |
| status | varchar(20) | yes | ACTIVE, INACTIVE, LOCKED |
| lastLoginAt | timestamptz | no | last successful login |
| createdAt | timestamptz | yes | default now |
| updatedAt | timestamptz | yes | updated on change |
| deletedAt | timestamptz | no | soft delete marker |

Indexes and constraints:

- primary key on `id`
- unique index on `username`
- unique index on `email`
- index on `role`
- index on `status`

Notes:

- passwords are never returned in API responses
- status supports account disabling without deletion

### 2.2 optional refresh_tokens table

This is optional and can be omitted in MVP v1. If refresh tokens are not implemented, do not create this table yet.

---

## 3. Member Service Schema

### 3.1 members

Purpose:

Stores library member profiles.

Columns:

| Column | Type | Required | Notes |
|---|---|---:|---|
| id | uuid | yes | primary key |
| fullName | varchar(150) | yes | member full name |
| email | varchar(255) | no | unique if present |
| phone | varchar(30) | no | phone number |
| address | text | no | address |
| membershipStatus | varchar(20) | yes | ACTIVE, INACTIVE, BLOCKED |
| notes | text | no | librarian notes |
| createdAt | timestamptz | yes | default now |
| updatedAt | timestamptz | yes | updated on change |
| deletedAt | timestamptz | no | soft delete |

Indexes and constraints:

- primary key on `id`
- unique index on `email` where email is not null if preferred
- index on `membershipStatus`
- full text search can be added later but is not required now

Business notes:

- a blocked member cannot borrow
- inactive members cannot borrow

---

## 4. Category Service Schema

### 4.1 categories

Purpose:

Stores book classification categories.

Columns:

| Column | Type | Required | Notes |
|---|---|---:|---|
| id | uuid | yes | primary key |
| name | varchar(100) | yes | category name |
| description | text | no | description |
| status | varchar(20) | yes | ACTIVE, INACTIVE |
| createdAt | timestamptz | yes | default now |
| updatedAt | timestamptz | yes | updated on change |
| deletedAt | timestamptz | no | soft delete |

Indexes and constraints:

- primary key on `id`
- unique index on active `name` if soft delete policy is used carefully
- index on `status`

Business notes:

- books may still reference a category that is later deactivated
- deleting a category should not physically remove related books

---

## 5. Book Service Schema

### 5.1 books

Purpose:

Stores library books and inventory counts.

Columns:

| Column | Type | Required | Notes |
|---|---|---:|---|
| id | uuid | yes | primary key |
| title | varchar(255) | yes | book title |
| author | varchar(255) | yes | author name |
| isbn | varchar(30) | no | unique if present |
| publishedYear | int | no | publication year |
| categoryId | uuid | yes | external id referencing category |
| totalCopies | int | yes | total owned copies |
| availableCopies | int | yes | currently available copies |
| status | varchar(20) | yes | ACTIVE, INACTIVE, ARCHIVED |
| createdAt | timestamptz | yes | default now |
| updatedAt | timestamptz | yes | updated on change |
| deletedAt | timestamptz | no | soft delete |

Indexes and constraints:

- primary key on `id`
- unique index on `isbn` where isbn is not null
- index on `categoryId`
- index on `status`
- check constraint `totalCopies >= 0`
- check constraint `availableCopies >= 0`
- check constraint `availableCopies <= totalCopies`

Business notes:

- categoryId is stored as an external reference, not as a foreign key to another service DB
- inventory updates must be atomic

### 5.2 book_inventory_adjustments

Purpose:

Audit-style table to record inventory change history.

This table is recommended because borrow and return flows affect book availability and it is useful to keep a trace.

Columns:

| Column | Type | Required | Notes |
|---|---|---:|---|
| id | uuid | yes | primary key |
| bookId | uuid | yes | book being changed |
| adjustmentType | varchar(30) | yes | INCREMENT or DECREMENT |
| quantity | int | yes | positive integer |
| reason | varchar(50) | yes | BORROW_CREATED, BOOK_RETURNED, ADMIN_ADJUSTMENT |
| referenceId | uuid | no | related borrow id or admin operation id |
| createdAt | timestamptz | yes | timestamp |

Indexes:

- index on `bookId`
- index on `referenceId`
- index on `reason`

Business notes:

- useful for debugging and proving inventory consistency
- should be written inside the same transaction as availability changes where feasible

---

## 6. Borrow Service Schema

### 6.1 borrows

Purpose:

Stores borrow records and return information.

Columns:

| Column | Type | Required | Notes |
|---|---|---:|---|
| id | uuid | yes | primary key |
| memberId | uuid | yes | external member id |
| bookId | uuid | yes | external book id |
| borrowDate | date | yes | borrow start date |
| dueDate | date | yes | due date |
| returnDate | date | no | actual return date |
| status | varchar(20) | yes | BORROWED, RETURNED, CANCELLED |
| overdueDays | int | no | optional denormalized field |
| fineGenerated | boolean | yes | default false |
| createdByUserId | uuid | no | auth user who processed borrow |
| returnedByUserId | uuid | no | auth user who processed return |
| createdAt | timestamptz | yes | default now |
| updatedAt | timestamptz | yes | updated on change |
| deletedAt | timestamptz | no | soft delete if ever needed |

Indexes and constraints:

- primary key on `id`
- index on `memberId`
- index on `bookId`
- index on `status`
- index on `borrowDate`
- index on `dueDate`
- check constraint `dueDate >= borrowDate`
- check constraint `returnDate is null or returnDate >= borrowDate`

Business notes:

- overdue state can be derived as `status = BORROWED and dueDate < current_date`, or stored as computed info in responses
- `fineGenerated` prevents duplicate fine creation in MVP

### 6.2 borrow_audit_logs optional

Recommended if you want richer traceability, but not strictly required in MVP.

Columns could include:

- id
- borrowId
- action
- actorUserId
- details JSONB
- createdAt

This can be skipped initially.

---

## 7. Fine Payment Service Schema

### 7.1 fines

Purpose:

Stores library fines created for overdue or damaged book cases.

Columns:

| Column | Type | Required | Notes |
|---|---|---:|---|
| id | uuid | yes | primary key |
| memberId | uuid | yes | external member id |
| borrowId | uuid | yes | external borrow id |
| amount | numeric(10,2) | yes | fine amount |
| reason | varchar(50) | yes | OVERDUE_RETURN, DAMAGE, OTHER |
| status | varchar(20) | yes | PENDING, PAID, WAIVED |
| issuedDate | date | yes | date fine created |
| paidDate | date | no | populated when fully paid |
| waivedDate | date | no | if waived |
| notes | text | no | human notes |
| createdAt | timestamptz | yes | default now |
| updatedAt | timestamptz | yes | updated on change |

Indexes and constraints:

- primary key on `id`
- index on `memberId`
- unique index on `borrowId` if only one fine per borrow is allowed in MVP
- index on `status`
- check constraint `amount >= 0`

Business notes:

- if partial payment is not supported, one borrow maps to one fine and one payment entry is usually enough
- if partial payments are added later, keep outstanding balance logic in this service only

### 7.2 fine_payments

Purpose:

Stores payment records against fines.

Columns:

| Column | Type | Required | Notes |
|---|---|---:|---|
| id | uuid | yes | primary key |
| fineId | uuid | yes | fine being paid |
| amount | numeric(10,2) | yes | payment amount |
| paymentMethod | varchar(20) | yes | CASH, CARD, ONLINE |
| paymentDate | date | yes | payment date |
| transactionReference | varchar(100) | no | optional reference |
| recordedByUserId | uuid | no | staff auth user id |
| createdAt | timestamptz | yes | default now |
| updatedAt | timestamptz | yes | updated on change |

Indexes and constraints:

- primary key on `id`
- index on `fineId`
- index on `paymentMethod`
- check constraint `amount >= 0`

Business notes:

- for MVP, payment amount should equal fine amount
- if partial payments are later supported, aggregate payment totals to derive outstanding balance

---

## 8. Recommended Prisma mapping notes

### 8.1 Separate Prisma schema per service

Each service should have its own Prisma schema file and client generation.

Recommended locations:

- `apps/auth-service/prisma/schema.prisma`
- `apps/member-service/prisma/schema.prisma`
- `apps/category-service/prisma/schema.prisma`
- `apps/book-service/prisma/schema.prisma`
- `apps/borrow-service/prisma/schema.prisma`
- `apps/fine-payment-service/prisma/schema.prisma`

### 8.2 External references are not Prisma relations

Because each service owns its own database, cross-service references should be stored as UUID fields without ORM foreign key relations to another service.

Examples:

- `memberId` in Borrow Service is just a UUID field
- `bookId` in Borrow Service is just a UUID field
- `categoryId` in Book Service is just a UUID field
- `borrowId` in Fine Service is just a UUID field

### 8.3 Internal relations allowed only inside same service DB

Example:

- Fine Payment Service can have a relation from `fine_payments` to `fines` because both are in the same service database

---

## 9. Data lifecycle and deletion policy

### 9.1 Auth users

Soft delete preferred.

### 9.2 Members

Soft delete or deactivate only.

Never hard delete members if historical borrows exist.

### 9.3 Categories

Soft delete preferred.

### 9.4 Books

Soft delete or archive preferred.

Never hard delete books if historical borrows exist.

### 9.5 Borrows

Do not hard delete normal borrow history.

If a delete endpoint exists for assignment simplicity, it should either:

- soft delete only when business safe, or
- be limited to admin and not allowed once finalized records exist

### 9.6 Fines and fine payments

Do not hard delete finalized financial records.

Use status transitions instead.

---

## 10. Derived fields and computed logic

### 10.1 Borrow overdue state

Can be computed using:

- current date
- dueDate
- returnDate
- status

Suggested computed response fields:

- `overdue`
- `daysOverdue`

### 10.2 Book availability state

Derived from:

- `status`
- `availableCopies`

Suggested computed response field:

- `available = status == ACTIVE and availableCopies > 0`

### 10.3 Fine paid state

Derived from:

- fine status
- sum of fine payments if partial support exists later

For MVP, store explicit fine status and keep logic simple.

---

## 11. Seed data recommendations

For implementation and demo, create seed scripts with sample records:

### 11.1 Auth seed

- admin account
- librarian account

### 11.2 Category seed

- Computer Science
- Literature
- History
- Children

### 11.3 Book seed

- 5 to 10 books with mixed categories and copy counts

### 11.4 Member seed

- 3 to 5 members with ACTIVE status
- 1 BLOCKED member for edge-case demo

### 11.5 Borrow seed optional

- one active borrow
- one returned borrow
- one overdue borrow if useful for fine demo

### 11.6 Fine seed optional

- one pending fine
- one paid fine

---

## 12. Suggested database names

Recommended logical database names:

- `auth_db`
- `member_db`
- `category_db`
- `book_db`
- `borrow_db`
- `fine_db`

If one PostgreSQL container is used, create all six databases.

---

## 13. Schema decision summary

Key schema decisions:

- UUID primary keys everywhere
- timestamps in UTC
- service-local ownership only
- cross-service references stored as UUIDs, not DB foreign keys
- soft deletion where historical consistency matters
- separate audit table for book inventory adjustments recommended
- fines and payments separated in Fine Payment Service
- borrow records remain historical source of truth for circulation

