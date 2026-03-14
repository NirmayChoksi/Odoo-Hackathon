export interface CreateProductDto {
  name: string;
  sku: string;
  category_id: number;
  unit: string;
  reorder_level?: number;
  unit_price?: number;
  initial_stock?: number;
  initial_location_id?: number;
  initial_reserved?: number;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  category_id?: number;
  unit?: string;
  reorder_level?: number;
  unit_price?: number;
}

export interface ProductFilters {
  category_id?: number;
  search?: string;
}
