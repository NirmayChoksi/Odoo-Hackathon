import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transfer_items')
export class TransferItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  transfer_id!: number;

  @Column({ type: 'int' })
  product_id!: number;

  @Column('decimal')
  quantity!: number;
}
