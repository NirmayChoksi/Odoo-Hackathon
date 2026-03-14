import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("delivery_items")
export class DeliveryItem {

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  delivery_id!: number

  @Column()
  product_id!: number

  @Column("decimal")
  quantity!: number
}