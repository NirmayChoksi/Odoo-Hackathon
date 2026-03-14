import { AppDataSource } from '../../config/database';
import { StockBalance } from '../../entities/StockBalance';
import { StockLedger } from '../../entities/StockLedger';
import { Location } from '../../entities/Location';
import { AdjustmentRepository } from './adjustment.repository';
import type { CreateAdjustmentDto, AdjustmentFilters } from './adjustment.model';

export const AdjustmentService = {
  async list(filters: AdjustmentFilters) {
    const data = await AdjustmentRepository.findAll(filters);
    return { success: true, data };
  },

  async get(id: number) {
    const data = await AdjustmentRepository.findById(id);
    if (!data) return { success: false, message: 'Adjustment not found.' };
    return { success: true, data };
  },

  async create(dto: CreateAdjustmentDto, userId: number) {
    if (!dto.product_id) return { success: false, message: 'Product is required.' };
    if (!dto.location_id) return { success: false, message: 'Location is required.' };
    if (dto.counted_quantity === undefined || dto.counted_quantity === null || dto.counted_quantity < 0) {
      return { success: false, message: 'Counted quantity must be 0 or greater.' };
    }
    if (!dto.reason?.trim()) return { success: false, message: 'Reason is required.' };

    const locationRepo = AppDataSource.getRepository(Location);
    const stockBalanceRepo = AppDataSource.getRepository(StockBalance);
    const ledgerRepo = AppDataSource.getRepository(StockLedger);

    const location = await locationRepo.findOne({ where: { id: dto.location_id } });
    if (!location) return { success: false, message: 'Location not found.' };

    let balance = await stockBalanceRepo.findOne({
      where: { product_id: dto.product_id, location_id: dto.location_id },
    });

    const previousQuantity = balance ? Number(balance.quantity) : 0;
    const delta = Number(dto.counted_quantity) - previousQuantity;

    if (balance) {
      balance.quantity = Number(dto.counted_quantity);
      await stockBalanceRepo.save(balance);
    } else {
      await stockBalanceRepo.save(
        stockBalanceRepo.create({
          product_id: dto.product_id,
          location_id: dto.location_id,
          quantity: dto.counted_quantity,
        }),
      );
    }

    await ledgerRepo.save({
      product_id: dto.product_id,
      warehouse_id: location.warehouse_id,
      location_id: dto.location_id,
      movement_type: 'ADJUSTMENT',
      quantity: delta,
      reference_type: 'ADJUSTMENT',
      reference_id: 0,
    });

    const adjustment = await AdjustmentRepository.create({
      product_id: dto.product_id,
      location_id: dto.location_id,
      counted_quantity: dto.counted_quantity,
      reason: dto.reason.trim(),
      created_by: userId,
    });

    await ledgerRepo
      .createQueryBuilder()
      .update()
      .set({ reference_id: adjustment.id })
      .where('reference_type = :rt AND reference_id = 0 AND product_id = :pid AND location_id = :lid', {
        rt: 'ADJUSTMENT',
        pid: dto.product_id,
        lid: dto.location_id,
      })
      .execute();

    return {
      success: true,
      message: `Stock adjusted. Previous: ${previousQuantity}, New: ${dto.counted_quantity}, Delta: ${delta >= 0 ? '+' : ''}${delta}.`,
      data: { adjustment, previousQuantity, newQuantity: dto.counted_quantity, delta },
    };
  },
};
