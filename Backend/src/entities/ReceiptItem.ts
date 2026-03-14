import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("receipt_items")
export class ReceiptItem {

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  receipt_id!: number

  @Column()
  product_id!: number

  @Column("decimal")
  quantity!: number
}