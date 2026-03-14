import { AppDataSource } from '../../config/database';
import { Location } from '../../entities/Location';

const repo = () => AppDataSource.getRepository(Location);

export const LocationRepository = {
  findAll(warehouse_id?: number) {
    const where = warehouse_id ? { warehouse_id } : {};
    return repo().find({ where, relations: ['warehouse'], order: { name: 'ASC' } });
  },
  findById(id: number) {
    return repo().findOne({ where: { id }, relations: ['warehouse'] });
  },
  findByWarehouse(warehouse_id: number) {
    return repo().find({ where: { warehouse_id } });
  },
  create(data: Partial<Location>) {
    return repo().save(repo().create(data));
  },
  save(entity: Location) {
    return repo().save(entity);
  },
  delete(id: number) {
    return repo().delete(id);
  },
};
