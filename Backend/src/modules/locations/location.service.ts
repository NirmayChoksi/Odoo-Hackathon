import { LocationRepository } from './location.repository';
import type { CreateLocationDto, UpdateLocationDto } from './location.model';

const VALID_TYPES = ['storage', 'production', 'dispatch'];

export const LocationService = {
  async list(warehouse_id?: number) {
    const data = await LocationRepository.findAll(warehouse_id);
    return { success: true, data };
  },

  async get(id: number) {
    const data = await LocationRepository.findById(id);
    if (!data) return { success: false, message: 'Location not found.' };
    return { success: true, data };
  },

  async create(dto: CreateLocationDto) {
    if (!dto.warehouse_id) return { success: false, message: 'Warehouse is required.' };
    if (!dto.name?.trim()) return { success: false, message: 'Name is required.' };
    if (!VALID_TYPES.includes(dto.type)) return { success: false, message: 'Type must be storage, production, or dispatch.' };
    const data = await LocationRepository.create({ warehouse_id: dto.warehouse_id, name: dto.name.trim(), type: dto.type });
    return { success: true, message: 'Location created.', data };
  },

  async update(id: number, dto: UpdateLocationDto) {
    const location = await LocationRepository.findById(id);
    if (!location) return { success: false, message: 'Location not found.' };
    if (dto.name?.trim()) location.name = dto.name.trim();
    if (dto.type && VALID_TYPES.includes(dto.type)) location.type = dto.type;
    const data = await LocationRepository.save(location);
    return { success: true, message: 'Location updated.', data };
  },

  async delete(id: number) {
    const location = await LocationRepository.findById(id);
    if (!location) return { success: false, message: 'Location not found.' };
    await LocationRepository.delete(id);
    return { success: true, message: 'Location deleted.' };
  },
};
