import { AppDataSource } from '../../config/database';
import { StockLedger } from '../../entities/StockLedger';
import { Location } from '../../entities/Location';
import { ProductRepository } from './product.repository';
import type { CreateProductDto, UpdateProductDto, ProductFilters } from './product.model';

export const ProductService = {
  async list(filters: ProductFilters) {
    const data = await ProductRepository.findAll(filters);
    return { success: true, data };
  },

  async get(id: number) {
    const data = await ProductRepository.findById(id);
    if (!data) return { success: false, message: 'Product not found.' };
    return { success: true, data };
  },

  async create(dto: CreateProductDto, userId: number) {
    if (!dto.name?.trim()) return { success: false, message: 'Name is required.' };
    if (!dto.sku?.trim()) return { success: false, message: 'SKU is required.' };
    if (!dto.unit?.trim()) return { success: false, message: 'Unit is required.' };
    if (!dto.category_id) return { success: false, message: 'Category is required.' };

    const existing = await ProductRepository.findBySku(dto.sku.trim());
    if (existing) return { success: false, message: 'A product with this SKU already exists.' };

    const product = await ProductRepository.create({
      name: dto.name.trim(),
      sku: dto.sku.trim(),
      category_id: dto.category_id,
      unit: dto.unit.trim(),
      reorder_level: dto.reorder_level ?? 0,
      unit_price: dto.unit_price ?? 0,
    });

    if (dto.initial_stock && dto.initial_stock > 0 && dto.initial_location_id) {
      await ProductRepository.saveStockBalance({
        product_id: product.id,
        location_id: dto.initial_location_id,
        quantity: dto.initial_stock,
        reserved_quantity: dto.initial_reserved ?? 0,
      });

      const locationRepo = AppDataSource.getRepository(Location);
      const loc = await locationRepo.findOne({ where: { id: dto.initial_location_id } });

      if (loc) {
        const ledgerRepo = AppDataSource.getRepository(StockLedger);
        await ledgerRepo.save({
          product_id: product.id,
          warehouse_id: loc.warehouse_id,
          location_id: dto.initial_location_id,
          movement_type: 'RECEIPT',
          quantity: dto.initial_stock,
          reference_type: 'INITIAL_STOCK',
          reference_id: product.id,
        });
      }
    }

    const data = await ProductRepository.findById(product.id);
    return { success: true, message: 'Product created.', data };
  },

  async update(id: number, dto: UpdateProductDto) {
    const product = await ProductRepository.findById(id);
    if (!product) return { success: false, message: 'Product not found.' };

    if (dto.sku && dto.sku.trim() !== product.sku) {
      const existing = await ProductRepository.findBySku(dto.sku.trim());
      if (existing) return { success: false, message: 'A product with this SKU already exists.' };
      product.sku = dto.sku.trim();
    }
    if (dto.name?.trim()) product.name = dto.name.trim();
    if (dto.category_id) product.category_id = dto.category_id;
    if (dto.unit?.trim()) product.unit = dto.unit.trim();
    if (dto.reorder_level !== undefined) product.reorder_level = dto.reorder_level;
    if (dto.unit_price    !== undefined) product.unit_price    = dto.unit_price;

    const data = await ProductRepository.save(product);
    return { success: true, message: 'Product updated.', data };
  },

  async delete(id: number) {
    const product = await ProductRepository.findById(id);
    if (!product) return { success: false, message: 'Product not found.' };
    await ProductRepository.delete(id);
    return { success: true, message: 'Product deleted.' };
  },

  async getStock(id: number) {
    const product = await ProductRepository.findById(id);
    if (!product) return { success: false, message: 'Product not found.' };
    const rows = await ProductRepository.getStockByProduct(id);
    return { success: true, data: rows };
  },
};
