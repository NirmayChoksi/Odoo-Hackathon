import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Warehouse } from './Warehouse';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  warehouse_id!: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Warehouse;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({
    type: 'enum',
    enum: ['storage', 'production', 'dispatch'],
  })
  type!: string;
}
