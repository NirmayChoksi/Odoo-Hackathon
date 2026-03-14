import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('delivery_items')
export class DeliveryItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  delivery_id!: number;

  @Column({ type: 'int' })
  product_id!: number;

  @Column('decimal')
  quantity!: number;
}
