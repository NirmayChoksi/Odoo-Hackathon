import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar',  nullable: true })
  email!: string;

  @Column({ type: 'varchar',  nullable: true })
  phone!: string;

  @Column({ type: 'varchar',  nullable: true })
  address!: string;
}
