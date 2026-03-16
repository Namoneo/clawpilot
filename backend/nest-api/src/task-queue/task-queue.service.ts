import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';

@Injectable()
export class TaskQueueService {
  constructor(
    @InjectQueue('agent-tasks') private agentTasksQueue: Queue,
    @InjectQueue('email-queue') private emailQueue: Queue,
    @InjectQueue('webhook-queue') private webhookQueue: Queue,
  ) {}

  // Agent task queues
  async addAgentTask(agentId: number, taskType: string, data: any): Promise<Job> {
    return this.agentTasksQueue.add({
      agentId,
      taskType,
      ...data,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addAgentRun(agentId: number, input: string): Promise<Job> {
    return this.addAgentTask(agentId, 'run', { input });
  }

  async addAgentSchedule(agentId: number, cronExpression: string): Promise<Job> {
    return this.addAgentTask(agentId, 'schedule', { cronExpression });
  }

  // Email queues
  async sendEmail(to: string, subject: string, template: string, data?: any): Promise<Job> {
    return this.emailQueue.add({ to, subject, template, data });
  }

  async sendWelcomeEmail(userId: number, email: string): Promise<Job> {
    return this.sendEmail(email, 'Welcome to ClawPilot', 'welcome', { userId });
  }

  // Webhook queues
  async triggerWebhook(url: string, event: string, payload: any): Promise<Job> {
    return this.webhookQueue.add({ url, event, payload, attempts: 3 });
  }

  // Queue health
  async getQueueStats() {
    const [agent, email, webhook] = await Promise.all([
      this.agentTasksQueue.getJobCounts(),
      this.emailQueue.getJobCounts(),
      this.webhookQueue.getJobCounts(),
    ]);

    return {
      agentTasks: agent,
      emailQueue: email,
      webhookQueue: webhook,
    };
  }
}
