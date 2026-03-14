import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Warehouse } from './Warehouse';

export type LocationType = 'Internal' | 'View' | 'Input/Output' | 'Virtual';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', name: 'short_code' })
  short_code!: string;

  @Column({ type: 'int' })
  warehouse_id!: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Warehouse;

  @Column({ type: 'varchar', name: 'location_type', default: 'Internal' })
  location_type!: LocationType;

  @Column({ type: 'varchar', name: 'parent_location', default: '' })
  parent_location!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;
}
