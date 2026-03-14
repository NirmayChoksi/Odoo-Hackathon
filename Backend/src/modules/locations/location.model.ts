export interface CreateLocationDto {
  warehouse_id: number;
  name: string;
  type: 'storage' | 'production' | 'dispatch';
}

export interface UpdateLocationDto {
  name?: string;
  type?: 'storage' | 'production' | 'dispatch';
}
