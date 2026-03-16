import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduledTask } from './entities/scheduled-task.entity';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectRepository(ScheduledTask)
    private taskRepository: Repository<ScheduledTask>,
  ) {}

  async create(userId: number, data: {
    name: string;
    agentId: number;
    cronExpression: string;
    enabled: boolean;
  }) {
    const task = this.taskRepository.create({
      ...data,
      userId,
      lastRun: null,
      nextRun: this.calculateNextRun(data.cronExpression),
    });
    return this.taskRepository.save(task);
  }

  async findAll(userId: number) {
    return this.taskRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number) {
    const task = await this.taskRepository.findOne({
      where: { id, userId },
    });
    if (!task) {
      throw new NotFoundException('Scheduled task not found');
    }
    return task;
  }

  async update(id: number, userId: number, data: Partial<ScheduledTask>) {
    const task = await this.findOne(id, userId);
    Object.assign(task, data);
    if (data.cronExpression) {
      task.nextRun = this.calculateNextRun(data.cronExpression);
    }
    return this.taskRepository.save(task);
  }

  async remove(id: number, userId: number) {
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);
    return { deleted: true };
  }

  async toggle(id: number, userId: number, enabled: boolean) {
    const task = await this.findOne(id, userId);
    task.enabled = enabled;
    if (enabled) {
      task.nextRun = this.calculateNextRun(task.cronExpression);
    }
    return this.taskRepository.save(task);
  }

  async getDueTasks() {
    const now = new Date();
    return this.taskRepository
      .createQueryBuilder('task')
      .where('task.enabled = :enabled', { enabled: true })
      .andWhere('task.nextRun <= :now', { now })
      .getMany();
  }

  async markRun(id: number) {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (task) {
      task.lastRun = new Date();
      task.nextRun = this.calculateNextRun(task.cronExpression);
      await this.taskRepository.save(task);
    }
  }

  private calculateNextRun(cronExpression: string): Date {
    // Simplified cron calculation - in production use cron-parser
    const now = new Date();
    const next = new Date(now);
    next.setMinutes(next.getMinutes() + 5); // Default 5 minutes
    return next;
  }
}
