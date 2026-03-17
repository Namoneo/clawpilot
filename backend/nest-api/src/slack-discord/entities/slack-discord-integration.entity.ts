import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum IntegrationType {
  SLACK = 'slack',
  DISCORD = 'discord',
}

@Entity('slack_discord_integrations')
export class SlackDiscordIntegration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: IntegrationType })
  type: IntegrationType;

  @Column()
  webhookUrl: string;

  @Column({ nullable: true })
  channelName: string;

  @Column('simple-array', { nullable: true })
  events: string[]; // agent.started, agent.stopped, agent.failed, billing

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastTriggeredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
