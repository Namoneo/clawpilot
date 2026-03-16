import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('agent_runs')
export class AgentRun {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  agentId: number;

  @Column({ default: 'running' })
  status: string;

  @Column({ default: 0 })
  tokensUsed: number;

  @Column({ type: 'text', nullable: true })
  logs: string;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
