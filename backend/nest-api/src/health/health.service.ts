import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async check() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: await this.checkDatabase(),
        agents: await this.checkAgents(),
      },
    };

    return checks;
  }

  async ready() {
    const db = await this.checkDatabase();
    if (db.status !== 'ok') {
      return { status: 'not_ready', reason: 'database not ready' };
    }
    return { status: 'ready' };
  }

  private async checkDatabase() {
    try {
      await this.userRepository.query('SELECT 1');
      return { status: 'ok', responseTime: 0 };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  private async checkAgents() {
    try {
      const total = await this.agentRepository.count();
      const running = await this.agentRepository.count({ where: { status: 'running' } });
      return { status: 'ok', total, running };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}
