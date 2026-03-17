import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlackDiscordIntegration, IntegrationType } from './entities/slack-discord-integration.entity';

const SLACK_WEBHOOK_PATTERN = /^https:\/\/hooks\.slack\.com\//;
const DISCORD_WEBHOOK_PATTERN = /^https:\/\/discord\.com\/api\/webhooks\//;

const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'metadata.google',
];

@Injectable()
export class SlackDiscordService {
  constructor(
    @InjectRepository(SlackDiscordIntegration)
    private integrationRepository: Repository<SlackDiscordIntegration>,
  ) {}

  private validateWebhookUrl(url: string, type: IntegrationType): void {
    let isValid = false;
    
    if (type === IntegrationType.SLACK) {
      isValid = SLACK_WEBHOOK_PATTERN.test(url);
    } else {
      isValid = DISCORD_WEBHOOK_PATTERN.test(url);
    }

    if (!isValid) {
      throw new BadRequestException(`Invalid ${type} webhook URL`);
    }

    // Block internal/private addresses
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (BLOCKED_HOSTS.includes(hostname)) {
        throw new BadRequestException('Internal addresses not allowed');
      }

      // Block private IP ranges
      if (hostname.startsWith('10.') || 
          hostname.startsWith('192.168.') || 
          hostname.startsWith('172.16.') ||
          hostname.startsWith('172.17.') ||
          hostname.startsWith('172.18.') ||
          hostname.startsWith('172.19.') ||
          hostname.startsWith('172.2') ||
          hostname.startsWith('172.30.') ||
          hostname.startsWith('172.31.')) {
        throw new BadRequestException('Private IP addresses not allowed');
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Invalid URL');
    }
  }

  async create(
    userId: number,
    type: IntegrationType,
    webhookUrl: string,
    events: string[],
    channelName?: string,
  ): Promise<SlackDiscordIntegration> {
    // Validate webhook URL
    this.validateWebhookUrl(webhookUrl, type);

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
