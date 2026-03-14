import { AppDataSource } from '../../config/database';
import { StockBalance } from '../../entities/StockBalance';
import { StockLedger } from '../../entities/StockLedger';
import { Location } from '../../entities/Location';
import { TransferRepository } from './transfer.repository';
import type { CreateTransferDto, AddTransferItemDto, TransferFilters } from './transfer.model';

const DONE_STATUSES = ['done', 'cancelled'];

export const TransferService = {
  async list(filters: TransferFilters) {
    const data = await TransferRepository.findAll(filters);
    return { success: true, data };
  },

  async get(id: number) {
    const transfer = await TransferRepository.findById(id);
    if (!transfer) return { success: false, message: 'Transfer not found.' };
    const items = await TransferRepository.findItemsByTransfer(id);
    return { success: true, data: { ...transfer, items } };
  },

  async create(dto: CreateTransferDto, userId: number) {
    if (!dto.from_location) return { success: false, message: 'Source location is required.' };
    if (!dto.to_location) return { success: false, message: 'Destination location is required.' };
    if (dto.from_location === dto.to_location) {
      return { success: false, message: 'Source and destination locations must be different.' };
    }
    const data = await TransferRepository.create({
      from_location: dto.from_location,
      to_location: dto.to_location,
      created_by: userId,
      status: 'draft',
    });
    return { success: true, message: 'Internal transfer created.', data };
  },

  async addItem(transferId: number, dto: AddTransferItemDto) {
    const transfer = await TransferRepository.findById(transferId);
    if (!transfer) return { success: false, message: 'Transfer not found.' };
    if (DONE_STATUSES.includes(transfer.status)) {
      return { success: false, message: `Cannot modify a ${transfer.status} transfer.` };
    }
    if (!dto.product_id) return { success: false, message: 'Product is required.' };
    if (!dto.quantity || dto.quantity <= 0) return { success: false, message: 'Quantity must be greater than 0.' };

    const data = await TransferRepository.addItem({ transfer_id: transferId, product_id: dto.product_id, quantity: dto.quantity });
    if (transfer.status === 'draft') {
      transfer.status = 'ready';
      await TransferRepository.save(transfer);
    }
    return { success: true, message: 'Item added.', data };
  },

  async removeItem(transferId: number, itemId: number) {
    const transfer = await TransferRepository.findById(transferId);
    if (!transfer) return { success: false, message: 'Transfer not found.' };
    if (DONE_STATUSES.includes(transfer.status)) {
      return { success: false, message: `Cannot modify a ${transfer.status} transfer.` };
    }
    const item = await TransferRepository.findItemById(itemId);
    if (!item || item.transfer_id !== transferId) return { success: false, message: 'Item not found.' };
    await TransferRepository.removeItem(itemId);
    return { success: true, message: 'Item removed.' };
  },

  async updateStatus(id: number, status: string) {
    const transfer = await TransferRepository.findById(id);
    if (!transfer) return { success: false, message: 'Transfer not found.' };
    const valid = ['draft', 'ready', 'cancelled'];
    if (!valid.includes(status)) return { success: false, message: 'Invalid status.' };
    if (transfer.status === 'done') return { success: false, message: 'Transfer is already completed.' };
    transfer.status = status;
    const data = await TransferRepository.save(transfer);
    return { success: true, message: 'Status updated.', data };
  },

  async validate(id: number) {
    const transfer = await TransferRepository.findById(id);
    if (!transfer) return { success: false, message: 'Transfer not found.' };
    if (transfer.status === 'done') return { success: false, message: 'Transfer is already completed.' };
    if (transfer.status === 'cancelled') return { success: false, message: 'Cannot validate a cancelled transfer.' };

    const items = await TransferRepository.findItemsByTransfer(id);
    if (items.length === 0) return { success: false, message: 'Cannot validate a transfer with no items.' };

    const locationRepo = AppDataSource.getRepository(Location);
    const stockBalanceRepo = AppDataSource.getRepository(StockBalance);
    const ledgerRepo = AppDataSource.getRepository(StockLedger);

    const fromLocation = await locationRepo.findOne({ where: { id: transfer.from_location } });
    const toLocation = await locationRepo.findOne({ where: { id: transfer.to_location } });

    if (!fromLocation) return { success: false, message: 'Source location not found.' };
    if (!toLocation) return { success: false, message: 'Destination location not found.' };

    for (const item of items) {
      const fromBalance = await stockBalanceRepo.findOne({
        where: { product_id: item.product_id, location_id: transfer.from_location },
      });
      const available = fromBalance ? Number(fromBalance.quantity) : 0;
      if (available < Number(item.quantity)) {
        return {
          success: false,
          message: `Insufficient stock for product ID ${item.product_id} at source location. Available: ${available}, Required: ${item.quantity}.`,
        };
      }
    }

    for (const item of items) {
      const fromBalance = await stockBalanceRepo.findOne({
        where: { product_id: item.product_id, location_id: transfer.from_location },
      });
      fromBalance!.quantity = Number(fromBalance!.quantity) - Number(item.quantity);
      await stockBalanceRepo.save(fromBalance!);

      let toBalance = await stockBalanceRepo.findOne({
        where: { product_id: item.product_id, location_id: transfer.to_location },
      });
      if (toBalance) {
        toBalance.quantity = Number(toBalance.quantity) + Number(item.quantity);
        await stockBalanceRepo.save(toBalance);
      } else {
        await stockBalanceRepo.save(
          stockBalanceRepo.create({
            product_id: item.product_id,
            location_id: transfer.to_location,
            quantity: item.quantity,
          }),
        );
      }

      await ledgerRepo.save({
        product_id: item.product_id,
        warehouse_id: fromLocation.warehouse_id,
        location_id: transfer.from_location,
        movement_type: 'TRANSFER_OUT',
        quantity: -Number(item.quantity),
        reference_type: 'TRANSFER',
        reference_id: transfer.id,
      });

      await ledgerRepo.save({
        product_id: item.product_id,
        warehouse_id: toLocation.warehouse_id,
        location_id: transfer.to_location,
        movement_type: 'TRANSFER_IN',
        quantity: Number(item.quantity),
        reference_type: 'TRANSFER',
        reference_id: transfer.id,
      });
    }

    transfer.status = 'done';
    await TransferRepository.save(transfer);

    return { success: true, message: `Transfer validated. ${items.length} product(s) moved from location ${fromLocation.name} to ${toLocation.name}.` };
  },

  async cancel(id: number) {
    const transfer = await TransferRepository.findById(id);
    if (!transfer) return { success: false, message: 'Transfer not found.' };
    if (transfer.status === 'done') return { success: false, message: 'Cannot cancel a completed transfer.' };
    transfer.status = 'cancelled';
    await TransferRepository.save(transfer);
    return { success: true, message: 'Transfer cancelled.' };
  },
};
