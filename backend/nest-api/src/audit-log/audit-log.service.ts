import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export enum AuditAction {
  // Auth
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_REGISTER = 'user.register',
  PASSWORD_CHANGE = 'password.change',
  
  // Agents
  AGENT_CREATE = 'agent.create',
  AGENT_UPDATE = 'agent.update',
  AGENT_DELETE = 'agent.delete',
  AGENT_START = 'agent.start',
  AGENT_STOP = 'agent.stop',
  
  // Billing
  PLAN_UPGRADE = 'plan.upgrade',
  PLAN_DOWNGRADE = 'plan.downgrade',
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  
  // API Keys
  API_KEY_CREATE = 'api_key.create',
  API_KEY_REVOKE = 'api_key.revoke',
  API_KEY_DELETE = 'api_key.delete',
  
  // Webhooks
  WEBHOOK_CREATE = 'webhook.create',
  WEBHOOK_UPDATE = 'webhook.update',
  WEBHOOK_DELETE = 'webhook.delete',
  
  // Settings
  SETTINGS_UPDATE = 'settings.update',
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(userId: number, action: AuditAction, details: Record<string, any>, ipAddress?: string) {
    const auditLog = this.auditLogRepository.create({
      userId,
      action,
      details: JSON.stringify(details),
      ipAddress,
    });
    
    await this.auditLogRepository.save(auditLog);
    this.logger.log(`Audit: ${action} by user ${userId}`);
  }

  async findAll(userId: number, options: {
    page?: number;
    limit?: number;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    const { page = 1, limit = 20, action, startDate, endDate } = options;
    
    const where: any = { userId };
    
    if (action) {
      where.action = action;
    }
    
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const [logs, total] = await this.auditLogRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats(userId: number, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.auditLogRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, new Date()),
      },
    });

    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: logs.length,
      byAction: actionCounts,
      period: days,
    };
  }
}
