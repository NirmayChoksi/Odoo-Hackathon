export interface CreateReceiptDto {
  supplier_id: number;
  warehouse_id: number;
}

export interface AddReceiptItemDto {
  product_id: number;
  quantity: number;
}

export interface ReceiptFilters {
  status?: string;
  warehouse_id?: number;
}
