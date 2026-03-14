import { AppDataSource } from '../../config/database';
import { StockBalance } from '../../entities/StockBalance';
import { StockLedger } from '../../entities/StockLedger';
import { Location } from '../../entities/Location';
import { DeliveryRepository } from './delivery.repository';
import type { CreateDeliveryDto, AddDeliveryItemDto, DeliveryFilters } from './delivery.model';

const DONE_STATUSES = ['done', 'cancelled'];

export const DeliveryService = {
  async list(filters: DeliveryFilters) {
    const data = await DeliveryRepository.findAll(filters);
    return { success: true, data };
  },

  async get(id: number) {
    const delivery = await DeliveryRepository.findById(id);
    if (!delivery) return { success: false, message: 'Delivery not found.' };
    const items = await DeliveryRepository.findItemsByDelivery(id);
    return { success: true, data: { ...delivery, items } };
  },

  async create(dto: CreateDeliveryDto, userId: number) {
    if (!dto.customer_id) return { success: false, message: 'Customer is required.' };
    if (!dto.warehouse_id) return { success: false, message: 'Warehouse is required.' };
    const data = await DeliveryRepository.create({
      customer_id: dto.customer_id,
      warehouse_id: dto.warehouse_id,
      created_by: userId,
      status: 'draft',
    });
    return { success: true, message: 'Delivery order created.', data };
  },

  async addItem(deliveryId: number, dto: AddDeliveryItemDto) {
    const delivery = await DeliveryRepository.findById(deliveryId);
    if (!delivery) return { success: false, message: 'Delivery not found.' };
    if (DONE_STATUSES.includes(delivery.status)) {
      return { success: false, message: `Cannot modify a ${delivery.status} delivery.` };
    }
    if (!dto.product_id) return { success: false, message: 'Product is required.' };
    if (!dto.quantity || dto.quantity <= 0) return { success: false, message: 'Quantity must be greater than 0.' };

    const data = await DeliveryRepository.addItem({ delivery_id: deliveryId, product_id: dto.product_id, quantity: dto.quantity });
    if (delivery.status === 'draft') {
      delivery.status = 'picking';
      await DeliveryRepository.save(delivery);
    }
    return { success: true, message: 'Item added.', data };
  },

  async removeItem(deliveryId: number, itemId: number) {
    const delivery = await DeliveryRepository.findById(deliveryId);
    if (!delivery) return { success: false, message: 'Delivery not found.' };
    if (DONE_STATUSES.includes(delivery.status)) {
      return { success: false, message: `Cannot modify a ${delivery.status} delivery.` };
    }
    const item = await DeliveryRepository.findItemById(itemId);
    if (!item || item.delivery_id !== deliveryId) return { success: false, message: 'Item not found.' };
    await DeliveryRepository.removeItem(itemId);
    return { success: true, message: 'Item removed.' };
  },

  async updateStatus(id: number, status: string) {
    const delivery = await DeliveryRepository.findById(id);
    if (!delivery) return { success: false, message: 'Delivery not found.' };
    const valid = ['draft', 'picking', 'packing', 'ready', 'cancelled'];
    if (!valid.includes(status)) return { success: false, message: 'Invalid status.' };
    if (delivery.status === 'done') return { success: false, message: 'Delivery is already validated.' };
    delivery.status = status;
    const data = await DeliveryRepository.save(delivery);
    return { success: true, message: 'Status updated.', data };
  },

  async validate(id: number) {
    const delivery = await DeliveryRepository.findById(id);
    if (!delivery) return { success: false, message: 'Delivery not found.' };
    if (delivery.status === 'done') return { success: false, message: 'Delivery is already validated.' };
    if (delivery.status === 'cancelled') return { success: false, message: 'Cannot validate a cancelled delivery.' };

    const items = await DeliveryRepository.findItemsByDelivery(id);
    if (items.length === 0) return { success: false, message: 'Cannot validate a delivery with no items.' };

    const locationRepo = AppDataSource.getRepository(Location);
    const stockBalanceRepo = AppDataSource.getRepository(StockBalance);
    const ledgerRepo = AppDataSource.getRepository(StockLedger);

    const warehouseLocations = await locationRepo.find({ where: { warehouse_id: delivery.warehouse_id } });
    const locationIds = warehouseLocations.map((l) => l.id);

    if (locationIds.length === 0) {
      return { success: false, message: 'No locations found for this warehouse.' };
    }

    for (const item of items) {
      const balances = await stockBalanceRepo
        .createQueryBuilder('sb')
        .where('sb.product_id = :pid', { pid: item.product_id })
        .andWhere('sb.location_id IN (:...lids)', { lids: locationIds })
        .orderBy('sb.quantity', 'DESC')
        .getMany();

      const totalStock = balances.reduce((sum, b) => sum + Number(b.quantity), 0);
      if (totalStock < Number(item.quantity)) {
        return {
          success: false,
          message: `Insufficient stock for product ID ${item.product_id}. Available: ${totalStock}, Required: ${item.quantity}.`,
        };
      }
    }

    for (const item of items) {
      const balances = await stockBalanceRepo
        .createQueryBuilder('sb')
        .where('sb.product_id = :pid', { pid: item.product_id })
        .andWhere('sb.location_id IN (:...lids)', { lids: locationIds })
        .orderBy('sb.quantity', 'DESC')
        .getMany();

      let remaining = Number(item.quantity);
      for (const balance of balances) {
        if (remaining <= 0) break;
        const deduct = Math.min(Number(balance.quantity), remaining);
        balance.quantity = Number(balance.quantity) - deduct;
        await stockBalanceRepo.save(balance);

        await ledgerRepo.save({
          product_id: item.product_id,
          warehouse_id: delivery.warehouse_id,
          location_id: balance.location_id,
          movement_type: 'DELIVERY',
          quantity: -deduct,
          reference_type: 'DELIVERY',
          reference_id: delivery.id,
        });

        remaining -= deduct;
      }
    }

    delivery.status = 'done';
    await DeliveryRepository.save(delivery);

    return { success: true, message: `Delivery validated. Stock reduced for ${items.length} product(s).` };
  },

  async cancel(id: number) {
    const delivery = await DeliveryRepository.findById(id);
    if (!delivery) return { success: false, message: 'Delivery not found.' };
    if (delivery.status === 'done') return { success: false, message: 'Cannot cancel a validated delivery.' };
    delivery.status = 'cancelled';
    await DeliveryRepository.save(delivery);
    return { success: true, message: 'Delivery cancelled.' };
  },
};
