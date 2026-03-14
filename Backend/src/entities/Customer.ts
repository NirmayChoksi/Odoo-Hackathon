import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("customers")
export class Customer {

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column({ nullable: true })
  email!: string

  @Column({ nullable: true })
  phone!: string

  @Column({ nullable: true })
  address!: string
}