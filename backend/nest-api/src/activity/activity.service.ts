import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async log(userId: number, type: string, message: string, metadata?: Record<string, any>) {
    const activity = this.activityRepository.create({
      userId,
      type,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
    return this.activityRepository.save(activity);
  }

  async findAll(userId: number, options: { page?: number; limit?: number; type?: string } = {}) {
    const { page = 1, limit = 20, type } = options;
    
    const where: any = { userId };
    if (type) where.type = type;

    const [activities, total] = await this.activityRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: activities,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getRecent(userId: number, limit: number = 10) {
    return this.activityRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.activityRepository.count({
      where: {
        userId,
        createdAt: MoreThanOrEqual(oneWeekAgo),
        read: false,
      },
    });
  }

  async markAsRead(id: number, userId: number) {
    const activity = await this.activityRepository.findOne({
      where: { id, userId },
    });
    if (activity) {
      activity.read = true;
      return this.activityRepository.save(activity);
    }
    return null;
  }

  async markAllAsRead(userId: number) {
    await this.activityRepository.update(
      { userId, read: false },
      { read: true }
    );
    return { updated: true };
  }
}
