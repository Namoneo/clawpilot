import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { AgentRun } from '../agents/entities/agent-run.entity';

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface DistributionBucket {
  range: string;
  count: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AgentRun)
    private agentRunRepository: Repository<AgentRun>,
  ) {}

  async getTokenUsageOverTime(userId: number, days: number = 30): Promise<TimeSeriesPoint[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const runs = await this.agentRunRepository
      .createQueryBuilder('run')
      .where('run.startedAt >= :startDate', { startDate })
      .orderBy('run.startedAt', 'ASC')
      .getMany();

    // Group by day
    const tokensByDay: Record<string, number> = {};
    
    runs.forEach(run => {
      const date = new Date(run.startedAt).toISOString().split('T')[0];
      tokensByDay[date] = (tokensByDay[date] || 0) + (run.tokensUsed || 0);
    });

    return Object.entries(tokensByDay).map(([date, value]) => ({ date, value }));
  }

  async getRunDurationDistribution(userId: number): Promise<DistributionBucket[]> {
    const runs = await this.agentRunRepository
      .createQueryBuilder('run')
      .where('run.finishedAt IS NOT NULL')
      .getMany();

    const durations = runs.map(run => {
      const start = new Date(run.startedAt).getTime();
      const end = new Date(run.finishedAt).getTime();
      return (end - start) / 1000; // seconds
    });

    const buckets = [
      { range: '0-30s', min: 0, max: 30, count: 0 },
      { range: '30s-1m', min: 30, max: 60, count: 0 },
      { range: '1-5m', min: 60, max: 300, count: 0 },
      { range: '5-15m', min: 300, max: 900, count: 0 },
      { range: '15-30m', min: 900, max: 1800, count: 0 },
      { range: '30m+', min: 1800, max: Infinity, count: 0 },
    ];

    durations.forEach(duration => {
      const bucket = buckets.find(b => duration >= b.min && duration < b.max);
      if (bucket) bucket.count++;
    });

    return buckets.map(b => ({ range: b.range, count: b.count }));
  }

  async getSuccessFailureRate(userId: number): Promise<{ success: number; failed: number; running: number }> {
    const runs = await this.agentRunRepository.find();
    
    return {
      success: runs.filter(r => r.status === 'completed').length,
      failed: runs.filter(r => r.status === 'failed').length,
      running: runs.filter(r => r.status === 'running').length,
    };
  }

  async getTopAgentsByRuns(userId: number, limit: number = 5): Promise<{ agentId: number; runCount: number }[]> {
    const runs = await this.agentRunRepository
      .createQueryBuilder('run')
      .select('run.agentId', 'agentId')
      .addSelect('COUNT(*)', 'runCount')
      .groupBy('run.agentId')
      .orderBy('runCount', 'DESC')
      .limit(limit)
      .getRawMany();

    return runs.map(r => ({ agentId: r.agentId, runCount: parseInt(r.runCount) }));
  }

  async getAverageTokensPerRun(userId: number): Promise<number> {
    const runs = await this.agentRunRepository.find();
    
    if (runs.length === 0) return 0;
    
    const totalTokens = runs.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);
    return Math.round(totalTokens / runs.length);
  }
}
