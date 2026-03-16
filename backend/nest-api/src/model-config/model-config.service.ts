import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelConfig, DEFAULT_MODELS, AVAILABLE_PROVIDERS } from './entities/model-config.entity';

@Injectable()
export class ModelConfigService {
  constructor(
    @InjectRepository(ModelConfig)
    private configRepository: Repository<ModelConfig>,
  ) {}

  async getDefaults() {
    return {
      defaults: DEFAULT_MODELS,
      providers: AVAILABLE_PROVIDERS,
    };
  }

  async getUserConfigs(userId: number, agentId?: number): Promise<ModelConfig[]> {
    const where: any = { userId };
    if (agentId) where.agentId = agentId;
    return this.configRepository.find({ where });
  }

  async setConfig(
    userId: number,
    role: string,
    provider: string,
    model: string,
    agentId?: number,
    settings?: Record<string, any>,
  ): Promise<ModelConfig> {
    // Check if exists
    let config = await this.configRepository.findOne({
      where: { userId, role, agentId },
    });

    if (config) {
      config.provider = provider;
      config.model = model;
      config.settings = settings;
    } else {
      config = this.configRepository.create({
        userId,
        agentId,
        role,
        provider,
        model,
        settings,
      });
    }

    return this.configRepository.save(config);
  }

  async getModelForRole(userId: number, role: string, agentId?: number): Promise<string> {
    // Check user/agent specific config
    const config = await this.configRepository.findOne({
      where: { userId, role, agentId: agentId || undefined },
    });

    if (config?.isActive) {
      return config.model;
    }

    // Fall back to defaults
    const defaults: Record<string, string> = DEFAULT_MODELS;
    return defaults[role] || defaults.planning;
  }

  async deleteConfig(id: number, userId: number): Promise<void> {
    const config = await this.configRepository.findOne({ where: { id, userId } });
    if (config) {
      await this.configRepository.remove(config);
    }
  }
}
