import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface CreateAuditLogDto {
  userId: number;
  action: string;
  entityType?: string;
  entityId?: number;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditRepository.create(dto);
    return this.auditRepository.save(auditLog);
  }

  async findByUser(userId: number, limit = 50): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByEntity(entityType: string, entityId: number): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByDateRange(start: Date, end: Date): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: {
        createdAt: Between(start, end),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserActivity(userId: number, days = 30): Promise<number> {
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    return this.auditRepository.count({
      where: {
        userId,
        createdAt: MoreThanOrEqual(start),
      },
    });
  }
}
