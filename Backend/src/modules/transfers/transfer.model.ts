export interface CreateTransferDto {
  from_location: number;
  to_location: number;
}

export interface AddTransferItemDto {
  product_id: number;
  quantity: number;
}

export interface TransferFilters {
  status?: string;
}
