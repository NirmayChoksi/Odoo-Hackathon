import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('customers')
export class Customer {
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
