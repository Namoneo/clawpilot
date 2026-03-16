import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: 'info' })
  severity: string; // info, warning, error, critical

  @Column({ default: 'system' })
  source: string; // system, agent, billing, security

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
