import { CategoryStatus } from '../enums/category-status.enum';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
