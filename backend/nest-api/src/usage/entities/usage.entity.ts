import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('usage')
export class Usage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  type: string; // tokens, runs, storage, agents

  @Column({ type: 'date' })
  period: Date;

  @Column({ type: 'bigint', default: 0 })
  used: number;

  @Column({ type: 'bigint', default: 0 })
  limit: number;

  @CreateDateColumn()
  createdAt: Date;
}
