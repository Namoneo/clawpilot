import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column('text')
  content: string;

  @Column()
  type: string; // pdf, markdown, txt, code, etc.

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: 'pending' })
  status: string; // pending, processing, completed, failed

  @Column({ type: 'int', nullable: true })
  chunks: number;

  @Column({ type: 'int', nullable: true })
  tokens: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
