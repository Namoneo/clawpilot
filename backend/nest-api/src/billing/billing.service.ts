import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';

export enum Plan {
  FREE = 'free',
  PRO = 'pro',
  TEAM = 'team',
}

export const PLANS = {
  [Plan.FREE]: {
    name: 'Free',
    price: 0,
    agents: 1,
    features: ['3 Templates', 'Basic Monitoring'],
  },
  [Plan.PRO]: {
    name: 'Pro',
    price: 29,
    agents: 5,
    features: ['All Templates', 'Advanced Monitoring', 'Priority Support'],
  },
  [Plan.TEAM]: {
    name: 'Team',
    price: 99,
    agents: 20,
    features: ['All Templates', 'Advanced Monitoring', 'Team Access', 'Private Templates'],
  },
};

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getPlan(userId: number): Promise<{ plan: string; limits: any }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      plan: user.plan,
      limits: PLANS[user.plan as Plan] || PLANS[Plan.FREE],
    };
  }

  async upgradePlan(userId: number, plan: Plan): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In production, validate Stripe payment here
    user.plan = plan;
    await this.userRepository.save(user);

    return {
      success: true,
      message: `Upgraded to ${PLANS[plan].name} plan`,
    };
  }

  async getUsage(userId: number): Promise<{
    agents_used: number;
    agents_limit: number;
    tokens_used: number;
    runs_count: number;
  }> {
    // In production, query from database
    return {
      agents_used: 0,
      agents_limit: PLANS[Plan.FREE].agents,
      tokens_used: 0,
      runs_count: 0,
    };
  }

  async checkAgentLimit(userId: number): Promise<boolean> {
    const { limits, agents_used } = await this.getUsage(userId);
    return agents_used < limits.agents;
  }

  getPlans() {
    return Object.entries(PLANS).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }
}
