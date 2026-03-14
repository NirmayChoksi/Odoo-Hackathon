import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  from_location!: number;

  @Column()
  to_location!: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'ready', 'done', 'cancelled'],
    default: 'draft',
  })
  status!: string;

  @Column()
  created_by!: number;
}
