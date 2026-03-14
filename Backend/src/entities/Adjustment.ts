import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('adjustments')
export class Adjustment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  product_id!: number;

  @Column({ type: 'int' })
  location_id!: number;

  @Column('decimal')
  counted_quantity!: number;

  @Column({ type: 'varchar' })
  reason!: string;

  @Column({ type: 'int' })
  created_by!: number;
}
