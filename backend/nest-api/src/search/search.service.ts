import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { AgentRun } from '../agents/entities/agent-run.entity';
import { User } from '../users/entities/user.entity';

export interface SearchResult {
  agents: Agent[];
  runs: AgentRun[];
  users: User[];
  total: number;
}

export interface SearchOptions {
  query: string;
  type?: 'all' | 'agents' | 'runs' | 'users';
  limit?: number;
  offset?: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(AgentRun)
    private runRepository: Repository<AgentRun>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async search(options: SearchOptions): Promise<SearchResult> {
    const { query, type = 'all', limit = 20, offset = 0 } = options;
    const searchPattern = `%${query}%`;

    const result: SearchResult = {
      agents: [],
      runs: [],
      users: [],
      total: 0,
    };

    // Get counts and data separately for accurate pagination
    if (type === 'all' || type === 'agents') {
      const [agents, totalAgents] = await this.agentRepository.findAndCount({
        where: [
          { name: ILike(searchPattern) },
          { description: ILike(searchPattern) },
        ],
        take: limit,
        skip: offset,
        relations: ['user'],
      });
      result.agents = agents;
      result.total += totalAgents;
    }

    if (type === 'all' || type === 'runs') {
      const [runs, totalRuns] = await this.runRepository.findAndCount({
        where: [
          { status: ILike(searchPattern) },
          { input: ILike(searchPattern) },
          { output: ILike(searchPattern) },
        ],
        take: limit,
        skip: offset,
        relations: ['agent', 'agent.user'],
      });
      result.runs = runs;
      result.total += totalRuns;
    }

    if (type === 'all' || type === 'users') {
      const [users, totalUsers] = await this.userRepository.findAndCount({
        where: [
          { email: ILike(searchPattern) },
          { name: ILike(searchPattern) },
        ],
        take: limit,
        skip: offset,
      });
      result.users = users;
      result.total += totalUsers;
    }

    return result;
  }

  async searchAgents(query: string, userId?: number): Promise<Agent[]> {
    const searchPattern = `%${query}%`;
    
    const whereConditions = [
      { name: ILike(searchPattern) },
      { description: ILike(searchPattern) },
    ];

    if (userId !== undefined) {
      whereConditions.push({ userId });
    }

    return this.agentRepository.find({
      where: whereConditions,
      take: 20,
      relations: ['user'],
    });
  }
}
