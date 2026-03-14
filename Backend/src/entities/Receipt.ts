import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  supplier_id!: number;

  @Column({ type: 'int' })
  warehouse_id!: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'waiting', 'ready', 'done', 'cancelled'],
    default: 'draft',
  })
  status!: string;

  @Column({ type: 'int' })
  created_by!: number;

  @CreateDateColumn()
  created_at!: Date;
}
