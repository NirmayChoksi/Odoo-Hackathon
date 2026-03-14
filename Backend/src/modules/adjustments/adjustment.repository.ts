import { AppDataSource } from '../../config/database';
import { Adjustment } from '../../entities/Adjustment';

const repo = () => AppDataSource.getRepository(Adjustment);

export const AdjustmentRepository = {
  findAll(filters: { product_id?: number; location_id?: number }) {
    const qb = repo().createQueryBuilder('a').orderBy('a.id', 'DESC');
    if (filters.product_id) qb.andWhere('a.product_id = :pid', { pid: filters.product_id });
    if (filters.location_id) qb.andWhere('a.location_id = :lid', { lid: filters.location_id });
    return qb.getMany();
  },

  findById(id: number) {
    return repo().findOne({ where: { id } });
  },

  create(data: Partial<Adjustment>) {
    return repo().save(repo().create(data));
  },
};
