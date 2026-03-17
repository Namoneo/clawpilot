import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  async create(userId: number, name: string, permissions?: string[], expiresAt?: Date): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const rawKey = `cp_${randomBytes(32).toString('hex')}`;
    const hashedKey = this.hashKey(rawKey);
    
    const apiKey = this.apiKeyRepository.create({
      userId,
      name,
      key: hashedKey,
      permissions: permissions || ['read'],
      expiresAt,
    });
    
    const saved = await this.apiKeyRepository.save(apiKey);
    return { apiKey: saved, rawKey };
  }

  async findByUser(userId: number): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async validate(key: string): Promise<ApiKey | null> {
    const hashedKey = this.hashKey(key);
    const apiKey = await this.apiKeyRepository.findOne({
      where: { key: hashedKey, isActive: true },
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
