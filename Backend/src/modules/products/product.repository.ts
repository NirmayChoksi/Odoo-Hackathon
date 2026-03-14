import { AppDataSource } from '../../config/database';
import { Product } from '../../entities/Product';
import { StockBalance } from '../../entities/StockBalance';
import { Location } from '../../entities/Location';

const repo = () => AppDataSource.getRepository(Product);
const stockRepo = () => AppDataSource.getRepository(StockBalance);
const locationRepo = () => AppDataSource.getRepository(Location);

export const ProductRepository = {
  findAll(filters: { category_id?: number; search?: string }) {
    const qb = repo()
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.name', 'ASC');
    if (filters.category_id) qb.andWhere('product.category_id = :cid', { cid: filters.category_id });
    if (filters.search) {
      qb.andWhere('(product.name LIKE :s OR product.sku LIKE :s)', { s: `%${filters.search}%` });
    }
    return qb.getMany();
  },

  findById(id: number) {
    return repo().findOne({ where: { id }, relations: ['category'] });
  },

  findBySku(sku: string) {
    return repo().findOne({ where: { sku } });
  },

  create(data: Partial<Product>) {
    return repo().save(repo().create(data));
  },

  save(entity: Product) {
    return repo().save(entity);
  },

  delete(id: number) {
    return repo().delete(id);
  },

  getStockByProduct(product_id: number) {
    return stockRepo()
      .createQueryBuilder('sb')
      .leftJoinAndMapOne('sb.location', Location, 'loc', 'loc.id = sb.location_id')
      .where('sb.product_id = :pid', { pid: product_id })
      .getRawMany();
  },

  getStockBalance(product_id: number, location_id: number) {
    return stockRepo().findOne({ where: { product_id, location_id } });
  },

  saveStockBalance(entity: Partial<StockBalance>) {
    return stockRepo().save(entity);
  },
};
