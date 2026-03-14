import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './Category';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar',  unique: true })
  sku!: string;

  @Column({ type: 'int' })
  category_id!: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ type: 'varchar' })
  unit!: string;

  @Column({ type: 'decimal', default: 0 })
  reorder_level!: number;

  @Column({ type: 'decimal', default: 0 })
  unit_price!: number;
}
