import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TaskQueueService } from './task-queue.service';
import { TaskQueueController } from './task-queue.controller';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue(
      { name: 'agent-tasks' },
      { name: 'email-queue' },
      { name: 'webhook-queue' },
    ),
    AgentsModule,
  ],
  controllers: [TaskQueueController],
  providers: [TaskQueueService],
  exports: [TaskQueueService],
})
export class TaskQueueModule {}
