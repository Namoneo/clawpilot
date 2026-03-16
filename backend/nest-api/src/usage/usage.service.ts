import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Usage } from './entities/usage.entity';

export const PLAN_LIMITS = {
  free: {
    agents: 1,
    tokens: 100000,
    runs: 100,
    storage: 1000, // MB
  },
  pro: {
    agents: 5,
    tokens: 1000000,
    runs: 1000,
    storage: 10000,
  },
  team: {
    agents: 20,
    tokens: 5000000,
    runs: 5000,
    storage: 100000,
  },
};

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(Usage)
    private usageRepository: Repository<Usage>,
  ) {}

  async track(userId: number, type: string, amount: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let usage = await this.usageRepository.findOne({
      where: {
        userId,
        type,
        period: today,
      },
    });

    if (!usage) {
      usage = this.usageRepository.create({
        userId,
        type,
        period: today,
        used: 0,
        limit: PLAN_LIMITS.free[type] || 0,
      });
    }

    usage.used += amount;
    return this.usageRepository.save(usage);
  }

  async getUsage(userId: number, type: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.usageRepository.find({
      where: {
        userId,
        type,
        period: Between(startDate, new Date()),
      },
      order: { period: 'DESC' },
    });
  }

  async getTotalUsage(userId: number, type: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usage = await this.usageRepository.find({
      where: {
        userId,
        type,
        period: Between(startOfMonth, new Date()),
      },
    });

    return usage.reduce((sum, u) => sum + u.used, 0);
  }

  async checkLimit(userId: number, type: string, plan: string = 'free'): Promise<{ allowed: boolean; used: number; limit: number }> {
    const used = await this.getTotalUsage(userId, type);
    const limit = PLAN_LIMITS[plan]?.[type] || PLAN_LIMITS.free[type];

    return {
      allowed: used < limit,
      used,
      limit,
    };
  }
}
