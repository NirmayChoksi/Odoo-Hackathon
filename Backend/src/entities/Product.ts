import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Category } from "./Category"

@Entity("products")
export class Product {

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column({ unique: true })
  sku!: string

  @Column()
  category_id!: number

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category!: Category

  @Column()
  unit!: string

  @Column({ type: "decimal", default: 0 })
  reorder_level!: number
}