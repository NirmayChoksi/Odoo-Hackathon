import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('stock_balances')
export class StockBalance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  product_id!: number;

  @Column()
  location_id!: number;

  @Column('decimal', { default: 0 })
  quantity!: number;
}
