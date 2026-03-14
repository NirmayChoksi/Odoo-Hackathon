import { AppDataSource } from '../../config/database';
import { Customer } from '../../entities/Customer';

const repo = () => AppDataSource.getRepository(Customer);

export const CustomerRepository = {
  findAll(search?: string) {
    const qb = repo().createQueryBuilder('c').orderBy('c.name', 'ASC');
    if (search) qb.where('c.name LIKE :s OR c.email LIKE :s', { s: `%${search}%` });
    return qb.getMany();
  },
  findById(id: number) {
    return repo().findOne({ where: { id } });
  },
  create(data: Partial<Customer>) {
    return repo().save(repo().create(data));
  },
  save(entity: Customer) {
    return repo().save(entity);
  },
  delete(id: number) {
    return repo().delete(id);
  },
};
