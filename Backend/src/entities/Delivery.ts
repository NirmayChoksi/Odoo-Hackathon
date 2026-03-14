import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  customer_id!: number;

  @Column({ type: 'int' })
  warehouse_id!: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'picking', 'packing', 'ready', 'done', 'cancelled'],
    default: 'draft',
  })
  status!: string;

  @Column({ type: 'int' })
  created_by!: number;
}
