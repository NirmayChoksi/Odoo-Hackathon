import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transfer_items')
export class TransferItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  transfer_id!: number;

  @Column()
  product_id!: number;

  @Column('decimal')
  quantity!: number;
}
