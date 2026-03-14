import { CustomerRepository } from './customer.repository';
import type { CreateCustomerDto, UpdateCustomerDto } from './customer.model';

export const CustomerService = {
  async list(search?: string) {
    const data = await CustomerRepository.findAll(search);
    return { success: true, data };
  },

  async get(id: number) {
    const data = await CustomerRepository.findById(id);
    if (!data) return { success: false, message: 'Customer not found.' };
    return { success: true, data };
  },

  async create(dto: CreateCustomerDto) {
    if (!dto.name?.trim()) return { success: false, message: 'Name is required.' };
    const data = await CustomerRepository.create({ ...dto, name: dto.name.trim() });
    return { success: true, message: 'Customer created.', data };
  },

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await CustomerRepository.findById(id);
    if (!customer) return { success: false, message: 'Customer not found.' };
    Object.assign(customer, dto);
    if (dto.name?.trim()) customer.name = dto.name.trim();
    const data = await CustomerRepository.save(customer);
    return { success: true, message: 'Customer updated.', data };
  },

  async delete(id: number) {
    const customer = await CustomerRepository.findById(id);
    if (!customer) return { success: false, message: 'Customer not found.' };
    await CustomerRepository.delete(id);
    return { success: true, message: 'Customer deleted.' };
  },
};
