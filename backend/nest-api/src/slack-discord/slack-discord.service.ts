import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlackDiscordIntegration, IntegrationType } from './entities/slack-discord-integration.entity';

@Injectable()
export class SlackDiscordService {
  constructor(
    @InjectRepository(SlackDiscordIntegration)
    private integrationRepository: Repository<SlackDiscordIntegration>,
  ) {}

  async create(
    userId: number,
    type: IntegrationType,
    webhookUrl: string,
    events: string[],
    channelName?: string,
  ): Promise<SlackDiscordIntegration> {
    const integration = this.integrationRepository.create({
      userId,
      type,
      webhookUrl,
      events,
      channelName,
    });
    return this.integrationRepository.save(integration);
  }

  async findByUser(userId: number): Promise<SlackDiscordIntegration[]> {
    return this.integrationRepository.find({
      where: { userId, isActive: true },
    });
  }

  async sendNotification(
    userId: number,
    event: string,
    message: { title: string; text: string; color?: string },
  ): Promise<void> {
    const integrations = await this.integrationRepository.find({
      where: { userId, isActive: true },
    });

    for (const integration of integrations) {
      if (!integration.events.includes(event) && !integration.events.includes('*')) {
        continue;
      }

      const payload = this.buildPayload(integration.type, message);
      
      try {
        await fetch(integration.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        await this.integrationRepository.update(integration.id, { lastTriggeredAt: new Date() });
      } catch (error) {
        console.error(`Failed to send ${integration.type} notification:`, error);
      }
    }
  }

  private buildPayload(type: IntegrationType, message: { title: string; text: string; color?: string }) {
    if (type === IntegrationType.SLACK) {
      return {
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: message.title },
          },
          {
            type: 'section',
            text: { type: 'mrkdwn', text: message.text },
          },
        ],
      };
    }

    // Discord
    return {
      embeds: [{
        title: message.title,
        description: message.text,
        color: message.color ? parseInt(message.color.replace('#', ''), 16) : 0x5865F2,
        timestamp: new Date().toISOString(),
      }],
    };
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.integrationRepository.delete({ id, userId });
  }
}
