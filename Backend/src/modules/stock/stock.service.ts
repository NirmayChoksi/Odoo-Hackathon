import { AppDataSource } from '../../config/database';
import { StockBalance } from '../../entities/StockBalance';
import { StockLedger } from '../../entities/StockLedger';
import { Product } from '../../entities/Product';

export const StockService = {
  async getLedger(filters: {
    product_id?: number;
    location_id?: number;
    warehouse_id?: number;
    movement_type?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 200);
    const skip = (page - 1) * limit;

    const qb = AppDataSource.getRepository(StockLedger)
      .createQueryBuilder('sl')
      .orderBy('sl.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.product_id) qb.andWhere('sl.product_id = :pid', { pid: filters.product_id });
    if (filters.location_id) qb.andWhere('sl.location_id = :lid', { lid: filters.location_id });
    if (filters.warehouse_id) qb.andWhere('sl.warehouse_id = :wid', { wid: filters.warehouse_id });
    if (filters.movement_type) qb.andWhere('sl.movement_type = :mt', { mt: filters.movement_type });

    const [data, total] = await qb.getManyAndCount();
    return { success: true, data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  },

  async getBalances(filters: { product_id?: number; location_id?: number; warehouse_id?: number }) {
    const qb = AppDataSource.getRepository(StockBalance)
      .createQueryBuilder('sb')
      .innerJoin('products',   'p',   'p.id   = sb.product_id')
      .innerJoin('categories', 'cat', 'cat.id = p.category_id')
      .innerJoin('locations',  'loc', 'loc.id = sb.location_id')
      .innerJoin('warehouses', 'wh',  'wh.id  = loc.warehouse_id')
      .select([
        'sb.id                 AS id',
        'sb.product_id         AS product_id',
        'sb.location_id        AS location_id',
        'sb.quantity           AS quantity',
        'sb.reserved_quantity  AS reserved_quantity',
        'p.name                AS product_name',
        'p.sku                 AS sku',
        'p.unit                AS unit',
        'p.reorder_level       AS reorder_level',
        'p.unit_price          AS unit_price',
        'cat.name              AS category',
        'loc.name              AS location_name',
        'wh.id                 AS warehouse_id',
        'wh.name               AS warehouse_name',
      ])
      .orderBy('p.name', 'ASC');

    if (filters.product_id)  qb.andWhere('sb.product_id  = :pid', { pid: filters.product_id });
    if (filters.location_id) qb.andWhere('sb.location_id = :lid', { lid: filters.location_id });
    if (filters.warehouse_id) qb.andWhere('wh.id          = :wid', { wid: filters.warehouse_id });

    const data = await qb.getRawMany();
    return { success: true, data };
  },

  async getLowStock() {
    const products = await AppDataSource.getRepository(Product)
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .getMany();

    const stockBalanceRepo = AppDataSource.getRepository(StockBalance);

    const result = [];
    for (const product of products) {
      const balances = await stockBalanceRepo.find({ where: { product_id: product.id } });
      const totalStock = balances.reduce((sum, b) => sum + Number(b.quantity), 0);
      if (totalStock <= Number(product.reorder_level)) {
        result.push({
          product,
          totalStock,
          reorderLevel: product.reorder_level,
          status: totalStock === 0 ? 'out_of_stock' : 'low_stock',
        });
      }
    }

    return { success: true, data: result, count: result.length };
  },

  async adjustBalance(balanceId: number, dto: { quantity: number; reserved_quantity: number; note?: string }) {
    const repo = AppDataSource.getRepository(StockBalance);
    const balance = await repo.findOne({ where: { id: balanceId } });
    if (!balance) return { success: false, message: 'Stock balance record not found.' };

    const oldQty = Number(balance.quantity);
    const diff   = dto.quantity - oldQty;

    balance.quantity          = dto.quantity;
    balance.reserved_quantity = dto.reserved_quantity;
    await repo.save(balance);

    if (diff !== 0) {
      const ledgerRepo = AppDataSource.getRepository(StockLedger);
      await ledgerRepo.save({
        product_id:     balance.product_id,
        warehouse_id:   null as any,
        location_id:    balance.location_id,
        movement_type:  diff > 0 ? 'ADJUSTMENT' : 'ADJUSTMENT',
        quantity:       Math.abs(diff),
        reference_type: 'MANUAL_ADJUSTMENT',
        reference_id:   balanceId,
      });
    }

    return { success: true, message: 'Stock balance updated.' };
  },

  async getProductSummary(product_id: number) {
    const product = await AppDataSource.getRepository(Product).findOne({
      where: { id: product_id },
      relations: ['category'],
    });
    if (!product) return { success: false, message: 'Product not found.' };

    const balances = await AppDataSource.getRepository(StockBalance)
      .createQueryBuilder('sb')
      .where('sb.product_id = :pid', { pid: product_id })
      .getMany();

    const totalStock = balances.reduce((sum, b) => sum + Number(b.quantity), 0);
    const recentLedger = await AppDataSource.getRepository(StockLedger)
      .createQueryBuilder('sl')
      .where('sl.product_id = :pid', { pid: product_id })
      .orderBy('sl.created_at', 'DESC')
      .take(10)
      .getMany();

    return {
      success: true,
      data: { product, totalStock, balances, recentLedger },
    };
  },
};
