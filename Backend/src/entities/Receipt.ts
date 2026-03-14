import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity("receipts")
export class Receipt {

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  supplier_id!: number

  @Column()
  warehouse_id!: number

  @Column({
    type: "enum",
    enum: ["draft","waiting","ready","done","cancelled"],
    default: "draft"
  })
  status!: string

  @Column()
  created_by!: number

  @CreateDateColumn()
  created_at!: Date
}