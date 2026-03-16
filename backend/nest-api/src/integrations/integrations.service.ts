import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from './entities/integration.entity';

export enum IntegrationType {
  GITHUB = 'github',
  SLACK = 'slack',
  DISCORD = 'discord',
  NOTION = 'notion',
  LINEAR = 'linear',
  JIRA = 'jira',
  GITLAB = 'gitlab',
}

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
  ) {}

  async create(userId: number, type: IntegrationType, credentials: Record<string, any>) {
    const integration = this.integrationRepository.create({
      userId,
      type,
      credentials: JSON.stringify(credentials),
      active: true,
    });
    return this.integrationRepository.save(integration);
  }

  async findAll(userId: number) {
    const integrations = await this.integrationRepository.find({ where: { userId } });
    return integrations.map(i => ({
      ...i,
      credentials: undefined, // Don't expose credentials
    }));
  }

  async findOne(id: number, userId: number) {
    const integration = await this.integrationRepository.findOne({
      where: { id, userId },
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    return {
      ...integration,
      credentials: undefined,
    };
  }

  async update(id: number, userId: number, data: Partial<Integration>) {
    const integration = await this.integrationRepository.findOne({
      where: { id, userId },
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    Object.assign(integration, data);
    return this.integrationRepository.save(integration);
  }

  async remove(id: number, userId: number) {
    const integration = await this.integrationRepository.findOne({
      where: { id, userId },
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    await this.integrationRepository.remove(integration);
    return { deleted: true };
  }

  async toggle(id: number, userId: number, active: boolean) {
    const integration = await this.integrationRepository.findOne({
      where: { id, userId },
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    integration.active = active;
    return this.integrationRepository.save(integration);
  }

  getIntegrationTypes() {
    return Object.values(IntegrationType).map(type => ({
      id: type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      description: this.getDescription(type),
    }));
  }

  private getDescription(type: IntegrationType): string {
    const descriptions = {
      [IntegrationType.GITHUB]: 'Connect GitHub repositories for code analysis and automation',
      [IntegrationType.SLACK]: 'Send notifications and run commands via Slack',
      [IntegrationType.DISCORD]: 'Bot commands and notifications for Discord servers',
      [IntegrationType.NOTION]: 'Sync tasks and pages with Notion workspaces',
      [IntegrationType.LINEAR]: 'Create and manage issues in Linear',
      [IntegrationType.JIRA]: 'Connect to Atlassian Jira for project management',
      [IntegrationType.GITLAB]: 'CI/CD pipelines and GitLab automation',
    };
    return descriptions[type] || '';
  }
}
