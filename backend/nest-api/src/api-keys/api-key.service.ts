import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async create(userId: number, name: string, permissions?: string[], expiresAt?: Date): Promise<ApiKey> {
    const key = `cp_${randomBytes(32).toString('hex')}`;
    
    const apiKey = this.apiKeyRepository.create({
      userId,
      name,
      key,
      permissions: permissions || ['read'],
      expiresAt,
    });
    
    return this.apiKeyRepository.save(apiKey);
  }

  async findByUser(userId: number): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async validate(key: string): Promise<ApiKey | null> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { key, isActive: true },
    });
    
    if (!apiKey) {
      return null;
    }
    
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return null;
    }
    
    // Update last used
    await this.apiKeyRepository.update(apiKey.id, { lastUsedAt: new Date() });
    
    return apiKey;
  }

  async revoke(id: number, userId: number): Promise<void> {
    const apiKey = await this.apiKeyRepository.findOne({ where: { id, userId } });
    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }
    await this.apiKeyRepository.update(id, { isActive: false });
  }

  async delete(id: number, userId: number): Promise<void> {
    const apiKey = await this.apiKeyRepository.findOne({ where: { id, userId } });
    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }
    await this.apiKeyRepository.remove(apiKey);
  }
}
