import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Warehouse } from "./Warehouse"

@Entity("locations")
export class Location {

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  warehouse_id!: number

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: "warehouse_id" })
  warehouse!: Warehouse

  @Column()
  name!: string

  @Column({
    type: "enum",
    enum: ["storage","production","dispatch"]
  })
  type!: string
}