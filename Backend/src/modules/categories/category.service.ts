import { CategoryRepository } from './category.repository';
import type { CreateCategoryDto, UpdateCategoryDto } from './category.model';

export const CategoryService = {
  async list() {
    const data = await CategoryRepository.findAll();
    return { success: true, data };
  },

  async get(id: number) {
    const data = await CategoryRepository.findById(id);
    if (!data) return { success: false, message: 'Category not found.' };
    return { success: true, data };
  },

  async create(dto: CreateCategoryDto) {
    if (!dto.name?.trim()) return { success: false, message: 'Name is required.' };
    const exists = await CategoryRepository.findByName(dto.name.trim());
    if (exists) return { success: false, message: 'Category with this name already exists.' };
    const data = await CategoryRepository.create({ name: dto.name.trim(), description: dto.description });
    return { success: true, message: 'Category created.', data };
  },

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await CategoryRepository.findById(id);
    if (!category) return { success: false, message: 'Category not found.' };
    if (dto.name?.trim()) category.name = dto.name.trim();
    if (dto.description !== undefined) category.description = dto.description;
    const data = await CategoryRepository.save(category);
    return { success: true, message: 'Category updated.', data };
  },

  async delete(id: number) {
    const category = await CategoryRepository.findById(id);
    if (!category) return { success: false, message: 'Category not found.' };
    await CategoryRepository.delete(id);
    return { success: true, message: 'Category deleted.' };
  },
};
