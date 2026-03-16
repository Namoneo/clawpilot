import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  templateId: string;

  @Column({ type: 'jsonb', nullable: true })
  routing: Record<string, any>;

  @Column({ default: 'stopped' })
  status: string;

  @Column({ type: 'text', nullable: true })
  logs: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
