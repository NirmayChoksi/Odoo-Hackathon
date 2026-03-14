import { AppDataSource } from '../../config/database';
import { Product } from '../../entities/Product';
import { StockBalance } from '../../entities/StockBalance';
import { Receipt } from '../../entities/Receipt';
import { Delivery } from '../../entities/Delivery';
import { Transfer } from '../../entities/Transfer';

export const DashboardService = {
  async getKPIs(filters: { warehouse_id?: number }) {
    const productRepo = AppDataSource.getRepository(Product);
    const stockBalanceRepo = AppDataSource.getRepository(StockBalance);
    const receiptRepo = AppDataSource.getRepository(Receipt);
    const deliveryRepo = AppDataSource.getRepository(Delivery);
    const transferRepo = AppDataSource.getRepository(Transfer);

    const products = await productRepo.createQueryBuilder('p').leftJoinAndSelect('p.category', 'category').getMany();
    const totalProducts = products.length;

    const lowStockItems: { product: Product; totalStock: number }[] = [];
    const outOfStockItems: { product: Product }[] = [];

    for (const product of products) {
      const balances = await stockBalanceRepo.find({ where: { product_id: product.id } });
      const totalStock = balances.reduce((sum, b) => sum + Number(b.quantity), 0);
      if (totalStock === 0) {
        outOfStockItems.push({ product });
      } else if (totalStock <= Number(product.reorder_level)) {
        lowStockItems.push({ product, totalStock });
      }
    }

    const receiptQb = receiptRepo.createQueryBuilder('r');
    if (filters.warehouse_id) receiptQb.where('r.warehouse_id = :wid', { wid: filters.warehouse_id });
    const pendingReceipts = await receiptQb
      .andWhere('r.status IN (:...statuses)', { statuses: ['draft', 'waiting', 'ready'] })
      .getCount();

    const deliveryQb = deliveryRepo.createQueryBuilder('d');
    if (filters.warehouse_id) deliveryQb.where('d.warehouse_id = :wid', { wid: filters.warehouse_id });
    const pendingDeliveries = await deliveryQb
      .andWhere('d.status IN (:...statuses)', { statuses: ['draft', 'picking', 'packing', 'ready'] })
      .getCount();

    const pendingTransfers = await transferRepo
      .createQueryBuilder('t')
      .where('t.status IN (:...statuses)', { statuses: ['draft', 'ready'] })
      .getCount();

    const recentReceipts = await receiptRepo
      .createQueryBuilder('r')
      .orderBy('r.created_at', 'DESC')
      .take(5)
      .getMany();

    const recentDeliveries = await deliveryRepo
      .createQueryBuilder('d')
      .orderBy('d.id', 'DESC')
      .take(5)
      .getMany();

    return {
      success: true,
      data: {
        kpis: {
          totalProducts,
          lowStockCount: lowStockItems.length,
          outOfStockCount: outOfStockItems.length,
          pendingReceipts,
          pendingDeliveries,
          pendingTransfers,
        },
        alerts: {
          lowStock: lowStockItems.slice(0, 10),
          outOfStock: outOfStockItems.slice(0, 10),
        },
        recent: {
          receipts: recentReceipts,
          deliveries: recentDeliveries,
        },
      },
    };
  },
};
