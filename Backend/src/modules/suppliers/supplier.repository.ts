import { AppDataSource } from '../../config/database';
import { Supplier } from '../../entities/Supplier';

const repo = () => AppDataSource.getRepository(Supplier);

export const SupplierRepository = {
  findAll(search?: string) {
    const qb = repo().createQueryBuilder('s').orderBy('s.name', 'ASC');
    if (search) qb.where('s.name LIKE :s OR s.email LIKE :s', { s: `%${search}%` });
    return qb.getMany();
  },
  findById(id: number) {
    return repo().findOne({ where: { id } });
  },
  create(data: Partial<Supplier>) {
    return repo().save(repo().create(data));
  },
  save(entity: Supplier) {
    return repo().save(entity);
  },
  delete(id: number) {
    return repo().delete(id);
  },
};
