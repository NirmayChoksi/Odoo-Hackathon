import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  from_location!: number;

  @Column({ type: 'int' })
  to_location!: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'ready', 'done', 'cancelled'],
    default: 'draft',
  })
  status!: string;

  @Column({ type: 'int' })
  created_by!: number;
}
