import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from './entities/model.entity';

export enum ModelProvider {
  OPENROUTER = 'openrouter',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  OLLAMA = 'ollama',
  LOCAL = 'local',
}

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(Model)
    private modelRepository: Repository<Model>,
  ) {}

  async findAll(userId?: number) {
    if (userId) {
      return this.modelRepository.find({ where: { userId } });
    }
    // Return default models + user models
    return this.modelRepository.find();
  }

  async findOne(id: number) {
    const model = await this.modelRepository.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException('Model not found');
    }
    return model;
  }

  async findByProvider(provider: string) {
    return this.modelRepository.find({ where: { provider } });
  }

  async create(userId: number, data: Partial<Model>) {
    const model = this.modelRepository.create({
      ...data,
      userId,
    });
    return this.modelRepository.save(model);
  }

  async update(id: number, userId: number, data: Partial<Model>) {
    const model = await this.modelRepository.findOne({ where: { id, userId } });
    if (!model) {
      throw new NotFoundException('Model not found');
    }
    Object.assign(model, data);
    return this.modelRepository.save(model);
  }

  async remove(id: number, userId: number) {
    const model = await this.modelRepository.findOne({ where: { id, userId } });
    if (!model) {
      throw new NotFoundException('Model not found');
    }
    await this.modelRepository.remove(model);
    return { deleted: true };
  }

  getDefaultModels() {
    return [
      // OpenRouter models
      {
        name: 'Claude 3.5 Sonnet',
        provider: ModelProvider.OPENROUTER,
        modelId: 'anthropic/claude-3.5-sonnet',
        contextWindow: 200000,
        maxTokens: 8192,
        costPer1MInput: 3,
        costPer1MOutput: 15,
        supportsVision: true,
        supportsFunctionCalling: true,
      },
      {
        name: 'GPT-4o',
        provider: ModelProvider.OPENROUTER,
        modelId: 'openai/gpt-4o',
        contextWindow: 128000,
        maxTokens: 16384,
        costPer1MInput: 2.5,
        costPer1MOutput: 10,
        supportsVision: true,
        supportsFunctionCalling: true,
      },
      {
        name: 'GPT-4o Mini',
        provider: ModelProvider.OPENROUTER,
        modelId: 'openai/gpt-4o-mini',
        contextWindow: 128000,
        maxTokens: 16384,
        costPer1MInput: 0.15,
        costPer1MOutput: 0.6,
        supportsVision: true,
        supportsFunctionCalling: true,
      },
      {
        name: 'Hunter Alpha',
        provider: ModelProvider.OPENROUTER,
        modelId: 'openrouter/hunter-alpha',
        contextWindow: 1048576,
        maxTokens: 65536,
        costPer1MInput: 0,
        costPer1MOutput: 0,
        supportsReasoning: true,
      },
      // Ollama local models
      {
        name: 'Llama 3.1 8B',
        provider: ModelProvider.OLLAMA,
        modelId: 'llama3.1:8b',
        contextWindow: 131072,
        maxTokens: 8192,
        costPer1MInput: 0,
        costPer1MOutput: 0,
        isLocal: true,
      },
      {
        name: 'DeepSeek Coder V2',
        provider: ModelProvider.OLLAMA,
        modelId: 'deepseek-coder-v2:latest',
        contextWindow: 131072,
        maxTokens: 8192,
        costPer1MInput: 0,
        costPer1MOutput: 0,
        isLocal: true,
      },
      {
        name: 'Qwen 2.5 7B',
        provider: ModelProvider.OLLAMA,
        modelId: 'qwen2.5:7b',
        contextWindow: 131072,
        maxTokens: 8192,
        costPer1MInput: 0,
        costPer1MOutput: 0,
        isLocal: true,
      },
    ];
  }
}
