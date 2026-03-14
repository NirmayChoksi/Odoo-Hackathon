import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('adjustments')
export class Adjustment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  product_id!: number;

  @Column()
  location_id!: number;

  @Column('decimal')
  counted_quantity!: number;

  @Column()
  reason!: string;

  @Column()
  created_by!: number;
}
