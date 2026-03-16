import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from './entities/webhook.entity';

export enum WebhookEvent {
  AGENT_STARTED = 'agent.started',
  AGENT_STOPPED = 'agent.stopped',
  AGENT_FAILED = 'agent.failed',
  RUN_COMPLETED = 'run.completed',
  RUN_FAILED = 'run.failed',
  USER_REGISTERED = 'user.registered',
}

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook)
    private webhookRepository: Repository<Webhook>,
  ) {}

  async create(userId: number, url: string, events: string[], secret: string) {
    const webhook = this.webhookRepository.create({
      userId,
      url,
      events: events as WebhookEvent[],
      secret,
      active: true,
    });
    return this.webhookRepository.save(webhook);
  }

  async findAll(userId: number) {
    return this.webhookRepository.find({ where: { userId } });
  }

  async findOne(id: number, userId: number) {
    const webhook = await this.webhookRepository.findOne({ where: { id, userId } });
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }
    return webhook;
  }

  async remove(id: number, userId: number) {
    const webhook = await this.findOne(id, userId);
    await this.webhookRepository.remove(webhook);
    return { deleted: true };
  }

  async toggle(id: number, userId: number, active: boolean) {
    const webhook = await this.findOne(id, userId);
    webhook.active = active;
    return this.webhookRepository.save(webhook);
  }

  async trigger(event: WebhookEvent, data: any) {
    const webhooks = await this.webhookRepository
      .createQueryBuilder('webhook')
      .where('webhook.active = :active', { active: true })
      .andWhere('webhook.events LIKE :events', { events: `%${event}%` })
      .getMany();

    for (const webhook of webhooks) {
      try {
        await this.sendWebhook(webhook, event, data);
      } catch (error) {
        console.error(`Failed to send webhook ${webhook.id}:`, error);
      }
    }
  }

  private async sendWebhook(webhook: Webhook, event: WebhookEvent, data: any) {
    const timestamp = new Date().toISOString();
    const payload = {
      event,
      timestamp,
      data,
    };

    // In production, use actual HTTP client with signature verification
    console.log(`Sending webhook to ${webhook.url}:`, payload);
  }
}
