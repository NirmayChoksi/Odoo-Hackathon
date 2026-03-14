import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 12 })
  login_id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'inventory_manager', 'warehouse_staff'],
    default: 'warehouse_staff',
  })
  role!: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ nullable: true, type: 'varchar', length: 6 })
  otp!: string | null;

  @Column({ nullable: true, type: 'datetime' })
  otp_expires_at!: Date | null;

  @CreateDateColumn()
  created_at!: Date;
}
