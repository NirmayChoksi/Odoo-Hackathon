import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity("categories")
export class Category {

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column({ nullable: true })
  description!: string

  @CreateDateColumn()
  created_at!: Date
}