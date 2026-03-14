import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  customer_id!: number;

  @Column()
  warehouse_id!: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'picking', 'packing', 'ready', 'done', 'cancelled'],
    default: 'draft',
  })
  status!: string;

  @Column()
  created_by!: number;
}
