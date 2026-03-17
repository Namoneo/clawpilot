import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('model_configs')
export class ModelConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  agentId: number;

  @Column({ default: 'planning' })
  role: string; // planning, coding, chat, rag, review

  @Column()
  provider: string; // openrouter, ollama, moonshot

  @Column()
  model: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>; // temperature, max_tokens, etc.

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
