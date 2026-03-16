import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
  ) {}

  async create(userId: number, name: string) {
    const team = this.teamRepository.create({ name });
    const savedTeam = await this.teamRepository.save(team);

    // Add creator as owner
    const member = this.teamMemberRepository.create({
      teamId: savedTeam.id,
      userId,
      role: TeamRole.OWNER,
    });
    await this.teamMemberRepository.save(member);

    return savedTeam;
  }

  async findAll(userId: number) {
    const memberships = await this.teamMemberRepository.find({
      where: { userId },
      relations: ['team'],
    });
    return memberships.map(m => m.team);
  }

  async findOne(teamId: number, userId: number) {
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
    });
    if (!member) {
      throw new NotFoundException('Team not found or access denied');
    }

    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['members', 'members.user'],
    });
    return team;
  }

  async addMember(teamId: number, ownerId: number, newUserId: number, role: TeamRole) {
    // Verify owner has permission
    const ownerMember = await this.teamMemberRepository.findOne({
      where: { teamId, userId: ownerId },
    });
    if (!ownerMember || ![TeamRole.OWNER, TeamRole.ADMIN].includes(ownerMember.role)) {
      throw new ConflictException('Only owners and admins can add members');
    }

    // Check if already member
    const existing = await this.teamMemberRepository.findOne({
      where: { teamId, userId: newUserId },
    });
    if (existing) {
      throw new ConflictException('User is already a member');
    }

    const member = this.teamMemberRepository.create({
      teamId,
      userId: newUserId,
      role,
    });
    return this.teamMemberRepository.save(member);
  }

  async removeMember(teamId: number, ownerId: number, memberId: number) {
    const ownerMember = await this.teamMemberRepository.findOne({
      where: { teamId, userId: ownerId },
    });
    if (!ownerMember || ownerMember.role !== TeamRole.OWNER) {
      throw new ConflictException('Only owners can remove members');
    }

    const member = await this.teamMemberRepository.findOne({
      where: { id: memberId, teamId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.teamMemberRepository.remove(member);
    return { removed: true };
  }

  async getUserTeamIds(userId: number): Promise<number[]> {
    const memberships = await this.teamMemberRepository.find({
      where: { userId },
    });
    return memberships.map(m => m.teamId);
  }

  async isMember(teamId: number, userId: number): Promise<boolean> {
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
    });
    return !!member;
  }
}
