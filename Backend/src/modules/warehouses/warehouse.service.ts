import { WarehouseRepository } from './warehouse.repository';
import type { CreateWarehouseDto, UpdateWarehouseDto } from './warehouse.model';

export const WarehouseService = {
  async list() {
    const data = await WarehouseRepository.findAll();
    return { success: true, data };
  },

  async get(id: number) {
    const data = await WarehouseRepository.findById(id);
    if (!data) return { success: false, message: 'Warehouse not found.' };
    return { success: true, data };
  },

  async create(dto: CreateWarehouseDto) {
    if (!dto.name?.trim())       return { success: false, message: 'Name is required.' };
    if (!dto.short_code?.trim()) return { success: false, message: 'Short code is required.' };
    if (!dto.address?.trim())    return { success: false, message: 'Address is required.' };

    const data = await WarehouseRepository.create({
      name:       dto.name.trim(),
      short_code: dto.short_code.trim().toUpperCase(),
      address:    dto.address.trim(),
      type:       dto.type ?? 'Local',
      active:     dto.active ?? true,
    });
    return { success: true, message: 'Warehouse created.', data };
  },

  async update(id: number, dto: UpdateWarehouseDto) {
    const warehouse = await WarehouseRepository.findById(id);
    if (!warehouse) return { success: false, message: 'Warehouse not found.' };

    if (dto.name?.trim())       warehouse.name       = dto.name.trim();
    if (dto.short_code?.trim()) warehouse.short_code = dto.short_code.trim().toUpperCase();
    if (dto.address?.trim())    warehouse.address    = dto.address.trim();
    if (dto.type !== undefined)   warehouse.type     = dto.type;
    if (dto.active !== undefined) warehouse.active   = dto.active;

    const data = await WarehouseRepository.save(warehouse);
    return { success: true, message: 'Warehouse updated.', data };
  },

  async delete(id: number) {
    const warehouse = await WarehouseRepository.findById(id);
    if (!warehouse) return { success: false, message: 'Warehouse not found.' };
    await WarehouseRepository.delete(id);
    return { success: true, message: 'Warehouse deleted.' };
  },
};
