import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', name: 'short_code' })
  short_code!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar', default: 'Local' })
  type!: 'Local' | 'Transit';

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
