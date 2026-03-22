import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum AlertSource {
  SYSTEM = 'system',
  AGENT = 'agent',
  BILLING = 'billing',
  SECURITY = 'security',
}

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  async create(userId: number, data: {
    title: string;
    message: string;
    severity: AlertSeverity;
    source: AlertSource;
  }) {
    const alert = this.alertRepository.create({
      ...data,
      userId,
    });
    return this.alertRepository.save(alert);
  }

  async findAll(userId: number, options: { limit?: number; unread?: boolean } = {}) {
    const { limit = 50, unread = false } = options;
    
    const where: any = { userId };
    if (unread) where.read = false;

    return this.alertRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markAsRead(id: number, userId: number) {
    await this.alertRepository.update({ id, userId }, { read: true });
    return { success: true };
  }

  async markAllAsRead(userId: number) {
    await this.alertRepository.update({ userId, read: false }, { read: true });
    return { success: true };
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.alertRepository.count({ where: { userId, read: false } });
  }

  async delete(id: number, userId: number) {
    await this.alertRepository.delete({ id, userId });
    return { success: true };
  }

  // System alerts (called internally)
  async createSystemAlert(title: string, message: string, severity: AlertSeverity) {
    const alerts = await this.alertRepository.find();
    
    // Notify all users for system alerts
    for (const alert of alerts) {
      await this.create(alert.userId, {
        title,
        message,
        severity,
        source: AlertSource.SYSTEM,
      });
    }
  }
}
