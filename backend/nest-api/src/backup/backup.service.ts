import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Agent } from '../agents/entities/agent.entity';
import { AgentRun } from '../agents/entities/agent-run.entity';
import { existsSync, mkdirSync } from 'fs';
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

    // Export data as JSON (without relations to avoid circular refs)
    const users = await this.userRepository.find();
    const agents = await this.agentRepository.find();
    const runs = await this.runRepository.find();

    const data = {
      users: users.map(u => ({ ...u, password: undefined })),
      agents: agents.map(a => ({ ...a, userId: a.user?.id })),
      runs: runs.map(r => ({ ...r, agentId: r.agent?.id })),
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

    // Map old IDs to new IDs
    const userIdMap = new Map<number, number>();
    const agentIdMap = new Map<number, number>();

    // Restore users (skip existing)
    for (const user of data.users || []) {
      const existing = await this.userRepository.findOne({ where: { email: user.email } });
      if (!existing) {
        const { id, ...userData } = user;
        const saved = await this.userRepository.save(userData);
        userIdMap.set(id, saved.id);
        restored++;
      } else {
        userIdMap.set(id, existing.id);
      }
    }

    // Restore agents with correct user relationship
    for (const agent of data.agents || []) {
      const { id, userId, ...agentData } = agent;
      const newUserId = userIdMap.get(userId);
      
      if (newUserId) {
        const saved = await this.agentRepository.save({ ...agentData, userId: newUserId });
        agentIdMap.set(id, saved.id);
        restored++;
      }
    }

    // Restore runs with correct agent relationship
    for (const run of data.runs || []) {
      const { id, agentId, ...runData } = run;
      const newAgentId = agentIdMap.get(agentId);
      
      if (newAgentId) {
        await this.runRepository.save({ ...runData, agentId: newAgentId });
        restored++;
      }
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
