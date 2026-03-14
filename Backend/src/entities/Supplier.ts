import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("suppliers")
export class Supplier {

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