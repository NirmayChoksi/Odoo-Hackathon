import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity("users")
export class User {

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column({ unique: true })
  email!: string

  @Column()
  password!: string

  @Column({
    type: "enum",
    enum: ["admin","inventory_manager","warehouse_staff"],
    default: "warehouse_staff"
  })
  role!: string

  @Column({ default: true })
  is_active!: boolean

  @CreateDateColumn()
  created_at!: Date
}