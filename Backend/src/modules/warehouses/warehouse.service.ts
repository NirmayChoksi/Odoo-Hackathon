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
    if (!dto.name?.trim()) return { success: false, message: 'Name is required.' };
    if (!dto.location?.trim()) return { success: false, message: 'Location is required.' };
    const data = await WarehouseRepository.create({ name: dto.name.trim(), location: dto.location.trim() });
    return { success: true, message: 'Warehouse created.', data };
  },

  async update(id: number, dto: UpdateWarehouseDto) {
    const warehouse = await WarehouseRepository.findById(id);
    if (!warehouse) return { success: false, message: 'Warehouse not found.' };
    if (dto.name?.trim()) warehouse.name = dto.name.trim();
    if (dto.location?.trim()) warehouse.location = dto.location.trim();
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
