import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('stock_balances')
export class StockBalance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  product_id!: number;

  @Column({ type: 'int' })
  location_id!: number;

  @Column('decimal', { type: 'int',  default: 0 })
  quantity!: number;
}
