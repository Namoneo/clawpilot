import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { AgentRun } from '../agents/entities/agent-run.entity';
import { User } from '../auth/entities/user.entity';

export interface Metrics {
  totalAgents: number;
  activeAgents: number;
  totalRuns: number;
  totalTokens: number;
  successRate: number;
  avgRunTime: number;
  userCount: number;
}

export interface DailyMetrics {
  date: string;
  runs: number;
  tokens: number;
  success: number;
  failure: number;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(AgentRun)
    private agentRunRepository: Repository<AgentRun>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getMetrics(): Promise<Metrics> {
    const totalAgents = await this.agentRepository.count();
    const activeAgents = await this.agentRepository.count({ where: { status: 'running' } });
    const totalRuns = await this.agentRunRepository.count();
    
    const runs = await this.agentRunRepository.find();
    const totalTokens = runs.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);
    
    const completedRuns = runs.filter(r => r.status === 'completed').length;
    const successRate = totalRuns > 0 ? (completedRuns / totalRuns) * 100 : 0;
    
    const runTimes = runs
      .filter(r => r.startedAt && r.finishedAt)
      .map(r => new Date(r.finishedAt).getTime() - new Date(r.startedAt).getTime());
    const avgRunTime = runTimes.length > 0 
      ? runTimes.reduce((a, b) => a + b, 0) / runTimes.length / 1000 
      : 0;
    
    const userCount = await this.userRepository.count();

    return {
      totalAgents,
      activeAgents,
      totalRuns,
      totalTokens,
      successRate: Math.round(successRate * 100) / 100,
      avgRunTime: Math.round(avgRunTime),
      userCount,
    };
  }

  async getDailyMetrics(days: number = 7): Promise<DailyMetrics[]> {
    const metrics: DailyMetrics[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const startOfDay = new Date(dateStr);
      const endOfDay = new Date(dateStr);
      endOfDay.setDate(endOfDay.getDate() + 1);
      
      const runs = await this.agentRunRepository
        .createQueryBuilder('run')
        .where('run.createdAt >= :start', { start: startOfDay })
        .andWhere('run.createdAt < :end', { end: endOfDay })
        .getMany();
      
      metrics.push({
        date: dateStr,
        runs: runs.length,
        tokens: runs.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
        success: runs.filter(r => r.status === 'completed').length,
        failure: runs.filter(r => r.status === 'failed').length,
      });
    }
    
    return metrics.reverse();
  }

  async getAgentMetrics(agentId: number): Promise<{
    totalRuns: number;
    successRate: number;
    avgTokens: number;
    lastRun: Date | null;
  }> {
    const runs = await this.agentRunRepository.find({ where: { agentId } });
    
    const completed = runs.filter(r => r.status === 'completed').length;
    const successRate = runs.length > 0 ? (completed / runs.length) * 100 : 0;
    const avgTokens = runs.length > 0 
      ? runs.reduce((sum, r) => sum + (r.tokensUsed || 0), 0) / runs.length 
      : 0;
    
    const sortedRuns = runs.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    
    return {
      totalRuns: runs.length,
      successRate: Math.round(successRate * 100) / 100,
      avgTokens: Math.round(avgTokens),
      lastRun: sortedRuns.length > 0 ? sortedRuns[0].startedAt : null,
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async calculateMetrics() {
    this.logger.log('Calculating hourly metrics...');
    const metrics = await this.getMetrics();
    this.logger.log(`Metrics: ${JSON.stringify(metrics)}`);
  }
}
