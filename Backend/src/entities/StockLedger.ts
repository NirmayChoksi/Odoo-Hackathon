import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity("stock_ledger")
export class StockLedger {

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  product_id!: number

  @Column()
  warehouse_id!: number

  @Column()
  location_id!: number

  @Column({
    type: "enum",
    enum: [
      "RECEIPT",
      "DELIVERY",
      "TRANSFER_IN",
      "TRANSFER_OUT",
      "ADJUSTMENT"
    ]
  })
  movement_type!: string

  @Column("decimal")
  quantity!: number

  @Column()
  reference_type!: string

  @Column()
  reference_id!: number

  @CreateDateColumn()
  created_at!: Date
}