import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  subject: string;

  @Column('text')
  description: string;

  @Column()
  category: string; // billing, technical, feature, bug

  @Column({ default: 'open' })
  status: string; // open, in_progress, resolved, closed

  @Column({ default: 'medium' })
  priority: string; // low, medium, high, urgent

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ type: 'text', nullable: true })
  response: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
