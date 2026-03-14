import { AppDataSource } from '../../config/database';
import { Warehouse } from '../../entities/Warehouse';

const repo = () => AppDataSource.getRepository(Warehouse);

export const WarehouseRepository = {
  findAll() {
    return repo().find({ order: { name: 'ASC' } });
  },
  findById(id: number) {
    return repo().findOne({ where: { id } });
  },
  create(data: Partial<Warehouse>) {
    return repo().save(repo().create(data));
  },
  save(entity: Warehouse) {
    return repo().save(entity);
  },
  delete(id: number) {
    return repo().delete(id);
  },
};
