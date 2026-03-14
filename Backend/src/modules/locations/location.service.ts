import { LocationRepository } from './location.repository';
import type { CreateLocationDto, UpdateLocationDto } from './location.model';
import type { LocationType } from '../../entities/Location';

const VALID_TYPES: LocationType[] = ['Internal', 'View', 'Input/Output', 'Virtual'];

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
    if (!dto.name?.trim())       return { success: false, message: 'Name is required.' };
    if (!dto.short_code?.trim()) return { success: false, message: 'Short code is required.' };
    if (!dto.warehouse_id)       return { success: false, message: 'Warehouse is required.' };

    const locationType: LocationType = VALID_TYPES.includes(dto.location_type!)
      ? dto.location_type!
      : 'Internal';

    const data = await LocationRepository.create({
      name:            dto.name.trim(),
      short_code:      dto.short_code.trim().toUpperCase(),
      warehouse_id:    dto.warehouse_id,
      location_type:   locationType,
      parent_location: dto.parent_location?.trim() ?? '',
      active:          dto.active ?? true,
    });
    return { success: true, message: 'Location created.', data };
  },

  async update(id: number, dto: UpdateLocationDto) {
    const location = await LocationRepository.findById(id);
    if (!location) return { success: false, message: 'Location not found.' };

    if (dto.name?.trim())                              location.name            = dto.name.trim();
    if (dto.short_code?.trim())                        location.short_code      = dto.short_code.trim().toUpperCase();
    if (dto.warehouse_id)                              location.warehouse_id    = dto.warehouse_id;
    if (dto.location_type && VALID_TYPES.includes(dto.location_type)) location.location_type = dto.location_type;
    if (dto.parent_location !== undefined)             location.parent_location = dto.parent_location.trim();
    if (dto.active !== undefined)                      location.active          = dto.active;

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
