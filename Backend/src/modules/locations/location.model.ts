import type { LocationType } from '../../entities/Location';

export interface CreateLocationDto {
  name: string;
  short_code: string;
  warehouse_id: number;
  location_type?: LocationType;
  parent_location?: string;
  active?: boolean;
}

export interface UpdateLocationDto {
  name?: string;
  short_code?: string;
  warehouse_id?: number;
  location_type?: LocationType;
  parent_location?: string;
  active?: boolean;
}
