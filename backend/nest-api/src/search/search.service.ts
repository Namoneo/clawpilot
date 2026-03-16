import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Or } from 'typeorm';
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

    if (type === 'all' || type === 'agents') {
      result.agents = await this.agentRepository.find({
        where: [
          { name: ILike(searchPattern) },
          { description: ILike(searchPattern) },
        ],
        take: limit,
        skip: offset,
        relations: ['user'],
      });
    }

    if (type === 'all' || type === 'runs') {
      result.runs = await this.runRepository.find({
        where: [
          { status: ILike(searchPattern) },
          { input: ILike(searchPattern) },
          { output: ILike(searchPattern) },
        ],
        take: limit,
        skip: offset,
        relations: ['agent', 'agent.user'],
      });
    }

    if (type === 'all' || type === 'users') {
      result.users = await this.userRepository.find({
        where: [
          { email: ILike(searchPattern) },
          { name: ILike(searchPattern) },
        ],
        take: limit,
        skip: offset,
      });
    }

    result.total = result.agents.length + result.runs.length + result.users.length;
    return result;
  }

  async searchAgents(query: string, userId?: number): Promise<Agent[]> {
    const searchPattern = `%${query}%`;
    const where: any = [
      { name: ILike(searchPattern) },
      { description: ILike(searchPattern) },
    ];
    
    if (userId) {
      where.push({ userId });
    }

    return this.agentRepository.find({
      where: where,
      take: 20,
      relations: ['user'],
    });
  }
}
