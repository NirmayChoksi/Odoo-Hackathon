import { AppDataSource } from '../../config/database';
import { Transfer } from '../../entities/Transfer';
import { TransferItem } from '../../entities/TransferItem';

const repo = () => AppDataSource.getRepository(Transfer);
const itemRepo = () => AppDataSource.getRepository(TransferItem);

export const TransferRepository = {
  findAll(filters: { status?: string }) {
    const qb = repo().createQueryBuilder('t').orderBy('t.id', 'DESC');
    if (filters.status) qb.andWhere('t.status = :status', { status: filters.status });
    return qb.getMany();
  },

  findById(id: number) {
    return repo().findOne({ where: { id } });
  },

  create(data: Partial<Transfer>) {
    return repo().save(repo().create(data));
  },

  save(entity: Transfer) {
    return repo().save(entity);
  },

  findItemsByTransfer(transfer_id: number) {
    return itemRepo().find({ where: { transfer_id } });
  },

  findItemById(id: number) {
    return itemRepo().findOne({ where: { id } });
  },

  addItem(data: Partial<TransferItem>) {
    return itemRepo().save(itemRepo().create(data));
  },

  removeItem(id: number) {
    return itemRepo().delete(id);
  },
};
