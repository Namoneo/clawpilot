import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelConfig, ModelRole, ModelProvider, DEFAULT_MODELS, AVAILABLE_PROVIDERS } from './entities/model-config.entity';

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
    if (agentId !== undefined) where.agentId = agentId;
    return this.configRepository.find({ where });
  }

  async setConfig(
    userId: number,
    role: string,
    provider: string,
    model: string,
    agentId?: number,
    settings?: Record<string, unknown>,
  ): Promise<ModelConfig> {
    // Check if exists
    let config = await this.configRepository.findOne({
      where: { userId, role, ...(agentId !== undefined ? { agentId } : {}) },
    });

    if (config) {
      config.provider = provider as ModelProvider;
      config.model = model;
      config.settings = settings;
    } else {
      config = this.configRepository.create({
        userId,
        agentId,
        role: role as ModelRole,
        provider: provider as ModelProvider,
        model,
        settings,
      });
    }

    return this.configRepository.save(config);
  }

  async getModelForRole(userId: number, role: string, agentId?: number): Promise<string> {
    // Check user/agent specific config
    const config = await this.configRepository.findOne({
      where: { userId, role, ...(agentId !== undefined ? { agentId } : {}) },
    });

    if (config?.isActive) {
      return config.model;
    }

    // Fall back to defaults
    const defaults: Record<string, string> = DEFAULT_MODELS;
    return defaults[role] || defaults[ModelRole.PLANNING];
  }

  async deleteConfig(id: number, userId: number): Promise<void> {
    const config = await this.configRepository.findOne({ where: { id, userId } });
    if (config) {
      await this.configRepository.remove(config);
    }
  }
}
