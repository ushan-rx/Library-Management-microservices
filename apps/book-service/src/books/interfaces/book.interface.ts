import { BookStatus } from '../enums/book-status.enum';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  publishedYear: number | null;
  categoryId: string;
  totalCopies: number;
  availableCopies: number;
  status: BookStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
