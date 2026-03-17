import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { User } from '../users/entities/user.entity';
import { Agent } from '../agents/entities/agent.entity';
import { AgentRun } from '../agents/entities/agent-run.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Agent, AgentRun])],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupModule {}
