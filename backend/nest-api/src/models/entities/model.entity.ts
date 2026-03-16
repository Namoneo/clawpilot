import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('models')
export class Model {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number;

  @Column()
  name: string;

  @Column()
  provider: string;

  @Column()
  modelId: string;

  @Column({ default: 128000 })
  contextWindow: number;

  @Column({ default: 4096 })
  maxTokens: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPer1MInput: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPer1MOutput: number;

  @Column({ default: false })
  supportsVision: boolean;

  @Column({ default: false })
  supportsFunctionCalling: boolean;

  @Column({ default: false })
  supportsReasoning: boolean;

  @Column({ default: false })
  isLocal: boolean;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
