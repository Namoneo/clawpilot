import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from './entities/agent.entity';
import { AgentRun } from './entities/agent-run.entity';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(AgentRun)
    private agentRunRepository: Repository<AgentRun>,
  ) {}

  async create(userId: number, createAgentDto: CreateAgentDto) {
    const agent = this.agentRepository.create({
      userId,
      name: createAgentDto.name,
      templateId: createAgentDto.templateId,
      routing: createAgentDto.routing,
      status: 'stopped',
    });
    return this.agentRepository.save(agent);
  }

  async findAll(userId: number) {
    return this.agentRepository.find({ where: { userId } });
  }

  async findOne(id: number, userId: number) {
    const agent = await this.agentRepository.findOne({ where: { id, userId } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async start(id: number, userId: number) {
    const agent = await this.findOne(id, userId);
    agent.status = 'running';
    await this.agentRepository.save(agent);
    
    // Create run record
    const run = this.agentRunRepository.create({
      agentId: id,
      status: 'running',
      startedAt: new Date(),
    });
    await this.agentRunRepository.save(run);
    
    return { agent, runId: run.id };
  }

  async stop(id: number, userId: number) {
    const agent = await this.findOne(id, userId);
    agent.status = 'stopped';
    await this.agentRepository.save(agent);
    
    // Update latest run
    const latestRun = await this.agentRunRepository.findOne({
      where: { agentId: id },
      order: { startedAt: 'DESC' },
    });
    if (latestRun && latestRun.status === 'running') {
      latestRun.status = 'stopped';
      latestRun.finishedAt = new Date();
      await this.agentRunRepository.save(latestRun);
    }
    
    return agent;
  }

  async getLogs(id: number, userId: number) {
    await this.findOne(id, userId);
    const runs = await this.agentRunRepository.find({
      where: { agentId: id },
      order: { startedAt: 'DESC' },
      take: 10,
    });
    return runs;
  }

  async getRuns(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.agentRunRepository.find({
      where: { agentId: id },
      order: { startedAt: 'DESC' },
    });
  }
}
