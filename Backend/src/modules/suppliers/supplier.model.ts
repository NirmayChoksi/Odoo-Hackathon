export interface CreateSupplierDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}
