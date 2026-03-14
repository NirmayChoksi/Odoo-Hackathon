export interface CreateAdjustmentDto {
  product_id: number;
  location_id: number;
  counted_quantity: number;
  reason: string;
}

export interface AdjustmentFilters {
  product_id?: number;
  location_id?: number;
}
