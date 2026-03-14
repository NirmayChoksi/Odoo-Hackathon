import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stock_ledger')
export class StockLedger {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  product_id!: number;

  @Column({ type: 'int' })
  warehouse_id!: number;

  @Column({ type: 'int' })
  location_id!: number;

  @Column({
    type: 'enum',
    enum: ['RECEIPT', 'DELIVERY', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'],
  })
  movement_type!: string;

  @Column('decimal')
  quantity!: number;

  @Column({ type: 'varchar' })
  reference_type!: string;

  @Column({ type: 'int' })
  reference_id!: number;

  @CreateDateColumn()
  created_at!: Date;
}
