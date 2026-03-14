export interface CreateWarehouseDto {
  name: string;
  short_code: string;
  address: string;
  type?: 'Local' | 'Transit';
  active?: boolean;
}

export interface UpdateWarehouseDto {
  name?: string;
  short_code?: string;
  address?: string;
  type?: 'Local' | 'Transit';
  active?: boolean;
}
