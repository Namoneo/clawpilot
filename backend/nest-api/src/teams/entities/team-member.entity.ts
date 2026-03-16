import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from './team.entity';

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teamId: number;

  @Column()
  userId: number;

  @Column({ default: 'member' })
  role: string;

  @ManyToOne(() => Team, team => team.members)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @CreateDateColumn()
  createdAt: Date;
}
