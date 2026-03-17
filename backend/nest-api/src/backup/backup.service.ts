import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Agent } from '../agents/entities/agent.entity';
import { AgentRun } from '../agents/entities/agent-run.entity';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface BackupMetadata {
  id: string;
  createdAt: Date;
  size: number;
  userCount: number;
  agentCount: number;
  runCount: number;
}

@Injectable()
export class BackupService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(AgentRun)
    private runRepository: Repository<AgentRun>,
  ) {}

  async createBackup(): Promise<BackupMetadata> {
    const backupId = `backup_${Date.now()}`;
    const backupDir = join(process.cwd(), 'backups');
    
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    // Export data as JSON
    const data = {
      users: await this.userRepository.find(),
      agents: await this.agentRepository.find({ relations: ['user'] }),
      runs: await this.runRepository.find({ relations: ['agent'] }),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const filePath = join(backupDir, `${backupId}.json`);
    const fs = require('fs');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const stats = fs.statSync(filePath);

    return {
      id: backupId,
      createdAt: new Date(),
      size: stats.size,
      userCount: data.users.length,
      agentCount: data.agents.length,
      runCount: data.runs.length,
    };
  }

  async restoreBackup(backupId: string): Promise<{ restored: number }> {
    const backupDir = join(process.cwd(), 'backups');
    const filePath = join(backupDir, `${backupId}.json`);
    
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      throw new Error('Backup not found');
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let restored = 0;

    // Restore users (skip existing)
    for (const user of data.users || []) {
      const existing = await this.userRepository.findOne({ where: { email: user.email } });
      if (!existing) {
        await this.userRepository.save(user);
        restored++;
      }
    }

    // Restore agents
    for (const agent of data.agents || []) {
      const { user, ...agentData } = agent;
      await this.agentRepository.save(agentData);
      restored++;
    }

    // Restore runs
    for (const run of data.runs || []) {
      const { agent, ...runData } = run;
      await this.runRepository.save(runData);
      restored++;
    }

    return { restored };
  }

  async listBackups(): Promise<BackupMetadata[]> {
    const backupDir = join(process.cwd(), 'backups');
    const fs = require('fs');
    
    if (!fs.existsSync(backupDir)) {
      return [];
    }

    const files = fs.readdirSync(backupDir).filter(f => f.startsWith('backup_') && f.endsWith('.json'));
    
    return files.map(f => {
      const stats = fs.statSync(join(backupDir, f));
      return {
        id: f.replace('.json', ''),
        createdAt: stats.mtime,
        size: stats.size,
        userCount: 0,
        agentCount: 0,
        runCount: 0,
      };
    });
  }
}
