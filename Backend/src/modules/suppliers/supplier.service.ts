import { SupplierRepository } from './supplier.repository';
import type { CreateSupplierDto, UpdateSupplierDto } from './supplier.model';

export const SupplierService = {
  async list(search?: string) {
    const data = await SupplierRepository.findAll(search);
    return { success: true, data };
  },

  async get(id: number) {
    const data = await SupplierRepository.findById(id);
    if (!data) return { success: false, message: 'Supplier not found.' };
    return { success: true, data };
  },

  async create(dto: CreateSupplierDto) {
    if (!dto.name?.trim()) return { success: false, message: 'Name is required.' };
    const data = await SupplierRepository.create({ ...dto, name: dto.name.trim() });
    return { success: true, message: 'Supplier created.', data };
  },

  async update(id: number, dto: UpdateSupplierDto) {
    const supplier = await SupplierRepository.findById(id);
    if (!supplier) return { success: false, message: 'Supplier not found.' };
    Object.assign(supplier, dto);
    if (dto.name?.trim()) supplier.name = dto.name.trim();
    const data = await SupplierRepository.save(supplier);
    return { success: true, message: 'Supplier updated.', data };
  },

  async delete(id: number) {
    const supplier = await SupplierRepository.findById(id);
    if (!supplier) return { success: false, message: 'Supplier not found.' };
    await SupplierRepository.delete(id);
    return { success: true, message: 'Supplier deleted.' };
  },
};
