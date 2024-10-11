import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  ObjectIdColumn,
} from 'typeorm';

@Entity('event')
export class EventEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  ownerId: ObjectId;

  @Column({ type: 'enum', enum: ['public', 'invite-only'], default: 'public' })
  type: string;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column('simple-array')
  tags: string[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
