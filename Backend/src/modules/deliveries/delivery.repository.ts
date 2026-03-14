import { AppDataSource } from '../../config/database';
import { Delivery } from '../../entities/Delivery';
import { DeliveryItem } from '../../entities/DeliveryItem';

const repo = () => AppDataSource.getRepository(Delivery);
const itemRepo = () => AppDataSource.getRepository(DeliveryItem);

export const DeliveryRepository = {
  findAll(filters: { status?: string; warehouse_id?: number }) {
    const qb = repo().createQueryBuilder('d').orderBy('d.id', 'DESC');
    if (filters.status) qb.andWhere('d.status = :status', { status: filters.status });
    if (filters.warehouse_id) qb.andWhere('d.warehouse_id = :wid', { wid: filters.warehouse_id });
    return qb.getMany();
  },

  findById(id: number) {
    return repo().findOne({ where: { id } });
  },

  create(data: Partial<Delivery>) {
    return repo().save(repo().create(data));
  },

  save(entity: Delivery) {
    return repo().save(entity);
  },

  findItemsByDelivery(delivery_id: number) {
    return itemRepo().find({ where: { delivery_id } });
  },

  findItemById(id: number) {
    return itemRepo().findOne({ where: { id } });
  },

  addItem(data: Partial<DeliveryItem>) {
    return itemRepo().save(itemRepo().create(data));
  },

  removeItem(id: number) {
    return itemRepo().delete(id);
  },
};
