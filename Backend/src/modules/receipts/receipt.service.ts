import { AppDataSource } from '../../config/database';
import { StockBalance } from '../../entities/StockBalance';
import { StockLedger } from '../../entities/StockLedger';
import { Location } from '../../entities/Location';
import { ReceiptRepository } from './receipt.repository';
import type { CreateReceiptDto, AddReceiptItemDto, ReceiptFilters } from './receipt.model';

const DONE_STATUSES = ['done', 'cancelled'];

export const ReceiptService = {
  async list(filters: ReceiptFilters) {
    const data = await ReceiptRepository.findAll(filters);
    return { success: true, data };
  },

  async get(id: number) {
    const receipt = await ReceiptRepository.findById(id);
    if (!receipt) return { success: false, message: 'Receipt not found.' };
    const items = await ReceiptRepository.findItemsByReceipt(id);
    return { success: true, data: { ...receipt, items } };
  },

  async create(dto: CreateReceiptDto, userId: number) {
    if (!dto.supplier_id) return { success: false, message: 'Supplier is required.' };
    if (!dto.warehouse_id) return { success: false, message: 'Warehouse is required.' };
    const data = await ReceiptRepository.create({
      supplier_id: dto.supplier_id,
      warehouse_id: dto.warehouse_id,
      created_by: userId,
      status: 'draft',
    });
    return { success: true, message: 'Receipt created.', data };
  },

  async addItem(receiptId: number, dto: AddReceiptItemDto) {
    const receipt = await ReceiptRepository.findById(receiptId);
    if (!receipt) return { success: false, message: 'Receipt not found.' };
    if (DONE_STATUSES.includes(receipt.status)) {
      return { success: false, message: `Cannot modify a ${receipt.status} receipt.` };
    }
    if (!dto.product_id) return { success: false, message: 'Product is required.' };
    if (!dto.quantity || dto.quantity <= 0) return { success: false, message: 'Quantity must be greater than 0.' };

    const data = await ReceiptRepository.addItem({ receipt_id: receiptId, product_id: dto.product_id, quantity: dto.quantity });
    if (receipt.status === 'draft') {
      receipt.status = 'waiting';
      await ReceiptRepository.save(receipt);
    }
    return { success: true, message: 'Item added.', data };
  },

  async removeItem(receiptId: number, itemId: number) {
    const receipt = await ReceiptRepository.findById(receiptId);
    if (!receipt) return { success: false, message: 'Receipt not found.' };
    if (DONE_STATUSES.includes(receipt.status)) {
      return { success: false, message: `Cannot modify a ${receipt.status} receipt.` };
    }
    const item = await ReceiptRepository.findItemById(itemId);
    if (!item || item.receipt_id !== receiptId) return { success: false, message: 'Item not found.' };
    await ReceiptRepository.removeItem(itemId);
    return { success: true, message: 'Item removed.' };
  },

  async updateStatus(id: number, status: string) {
    const receipt = await ReceiptRepository.findById(id);
    if (!receipt) return { success: false, message: 'Receipt not found.' };
    const valid = ['draft', 'waiting', 'ready', 'cancelled'];
    if (!valid.includes(status)) return { success: false, message: 'Invalid status.' };
    if (receipt.status === 'done') return { success: false, message: 'Receipt is already validated.' };
    receipt.status = status;
    const data = await ReceiptRepository.save(receipt);
    return { success: true, message: 'Status updated.', data };
  },

  async validate(id: number) {
    const receipt = await ReceiptRepository.findById(id);
    if (!receipt) return { success: false, message: 'Receipt not found.' };
    if (receipt.status === 'done') return { success: false, message: 'Receipt is already validated.' };
    if (receipt.status === 'cancelled') return { success: false, message: 'Cannot validate a cancelled receipt.' };

    const items = await ReceiptRepository.findItemsByReceipt(id);
    if (items.length === 0) return { success: false, message: 'Cannot validate a receipt with no items.' };

    const locationRepo = AppDataSource.getRepository(Location);
    const stockBalanceRepo = AppDataSource.getRepository(StockBalance);
    const ledgerRepo = AppDataSource.getRepository(StockLedger);

    const defaultLocation = await locationRepo.findOne({
      where: { warehouse_id: receipt.warehouse_id, location_type: 'Internal' },
    });
    if (!defaultLocation) {
      return { success: false, message: 'No Internal location found in this warehouse. Please create one first.' };
    }

    for (const item of items) {
      let balance = await stockBalanceRepo.findOne({
        where: { product_id: item.product_id, location_id: defaultLocation.id },
      });

      if (balance) {
        balance.quantity = Number(balance.quantity) + Number(item.quantity);
        await stockBalanceRepo.save(balance);
      } else {
        await stockBalanceRepo.save(
          stockBalanceRepo.create({
            product_id: item.product_id,
            location_id: defaultLocation.id,
            quantity: item.quantity,
          }),
        );
      }

      await ledgerRepo.save({
        product_id: item.product_id,
        warehouse_id: receipt.warehouse_id,
        location_id: defaultLocation.id,
        movement_type: 'RECEIPT',
        quantity: item.quantity,
        reference_type: 'RECEIPT',
        reference_id: receipt.id,
      });
    }

    receipt.status = 'done';
    await ReceiptRepository.save(receipt);

    return { success: true, message: `Receipt validated. Stock updated for ${items.length} product(s).` };
  },

  async cancel(id: number) {
    const receipt = await ReceiptRepository.findById(id);
    if (!receipt) return { success: false, message: 'Receipt not found.' };
    if (receipt.status === 'done') return { success: false, message: 'Cannot cancel a validated receipt.' };
    receipt.status = 'cancelled';
    await ReceiptRepository.save(receipt);
    return { success: true, message: 'Receipt cancelled.' };
  },
};
