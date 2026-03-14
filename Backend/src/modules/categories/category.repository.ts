import { AppDataSource } from '../../config/database';
import { Category } from '../../entities/Category';

const repo = () => AppDataSource.getRepository(Category);

export const CategoryRepository = {
  findAll() {
    return repo().find({ order: { name: 'ASC' } });
  },
  findById(id: number) {
    return repo().findOne({ where: { id } });
  },
  findByName(name: string) {
    return repo().findOne({ where: { name } });
  },
  create(data: Partial<Category>) {
    return repo().save(repo().create(data));
  },
  save(entity: Category) {
    return repo().save(entity);
  },
  delete(id: number) {
    return repo().delete(id);
  },
};
