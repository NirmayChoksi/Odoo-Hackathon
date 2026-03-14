import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", unique: true, length: 12, name: "login_id" })
  loginId!: string

  @Column({ type: "varchar", unique: true })
  email!: string

  @Column({ type: "varchar" })
  password!: string

  @Column({
    type: "enum",
    enum: ["admin", "inventory_manager", "warehouse_staff"],
    default: "warehouse_staff",
  })
  role!: string

  @Column({ type: "boolean", default: true, name: "is_active" })
  isActive!: boolean

  @Column({ nullable: true, type: "varchar", length: 255 })
  otp!: string | null

  @Column({ nullable: true, type: "datetime", name: "otp_expires_at" })
  otpExpiresAt!: Date | null

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date
}
