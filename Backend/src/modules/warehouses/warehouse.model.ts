export interface CreateWarehouseDto {
  name: string;
  location: string;
}

export interface UpdateWarehouseDto {
  name?: string;
  location?: string;
}
