import { InventoryAdjustmentType } from '../enums/inventory-adjustment-type.enum';

export interface BookInventoryAdjustment {
  id: string;
  bookId: string;
  adjustmentType: InventoryAdjustmentType;
  quantity: number;
  reason: string;
  referenceId: string | null;
  createdAt: Date;
}
