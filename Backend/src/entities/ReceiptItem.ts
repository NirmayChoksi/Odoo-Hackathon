import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('receipt_items')
export class ReceiptItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  receipt_id!: number;

  @Column({ type: 'int' })
  product_id!: number;

  @Column('decimal')
  quantity!: number;
}
