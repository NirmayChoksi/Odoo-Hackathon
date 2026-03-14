import { AppDataSource } from '../../config/database';
import { Receipt } from '../../entities/Receipt';
import { ReceiptItem } from '../../entities/ReceiptItem';

const repo = () => AppDataSource.getRepository(Receipt);
const itemRepo = () => AppDataSource.getRepository(ReceiptItem);

export const ReceiptRepository = {
  findAll(filters: { status?: string; warehouse_id?: number }) {
    const qb = repo()
      .createQueryBuilder('r')
      .orderBy('r.created_at', 'DESC');
    if (filters.status) qb.andWhere('r.status = :status', { status: filters.status });
    if (filters.warehouse_id) qb.andWhere('r.warehouse_id = :wid', { wid: filters.warehouse_id });
    return qb.getMany();
  },

  findById(id: number) {
    return repo().findOne({ where: { id } });
  },

  create(data: Partial<Receipt>) {
    return repo().save(repo().create(data));
  },

  save(entity: Receipt) {
    return repo().save(entity);
  },

  delete(id: number) {
    return repo().delete(id);
  },

  findItemsByReceipt(receipt_id: number) {
    return itemRepo().find({ where: { receipt_id } });
  },

  findItemById(id: number) {
    return itemRepo().findOne({ where: { id } });
  },

  addItem(data: Partial<ReceiptItem>) {
    return itemRepo().save(itemRepo().create(data));
  },

  removeItem(id: number) {
    return itemRepo().delete(id);
  },
};
