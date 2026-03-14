export interface CreateDeliveryDto {
  customer_id: number;
  warehouse_id: number;
}

export interface AddDeliveryItemDto {
  product_id: number;
  quantity: number;
}

export interface DeliveryFilters {
  status?: string;
  warehouse_id?: number;
}
