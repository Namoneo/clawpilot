import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ModelRole {
  PLANNING = 'planning',
  CODING = 'coding',
  CHAT = 'chat',
  RAG = 'rag',
  REVIEW = 'review',
}

export enum ModelProvider {
  OPENROUTER = 'openrouter',
  OLLAMA = 'ollama',
  MOONSHOT = 'moonshot',
}

export interface ModelSettings {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

@Entity('model_configs')
export class ModelConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  agentId: number;

  @Column({ default: ModelRole.PLANNING })
  role: ModelRole;

  @Column()
  provider: ModelProvider;

  @Column()
  model: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: ModelSettings;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
