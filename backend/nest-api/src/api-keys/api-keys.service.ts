import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async create(userId: number, name: string, permissions: string[]) {
    const key = randomBytes(32).toString('hex');
    const prefix = 'cpk_';
    const fullKey = prefix + key;
    const hashedKey = createHash('sha256').update(key).digest('hex');

    const apiKey = this.apiKeyRepository.create({
      userId,
      name,
      keyPrefix: prefix + key.substring(0, 8),
      hashedKey,
      permissions,
      active: true,
    });

    await this.apiKeyRepository.save(apiKey);

    // Return the full key only once
    return {
      id: apiKey.id,
      name: apiKey.name,
      key: fullKey, // Only returned on creation
      permissions: apiKey.permissions,
      createdAt: apiKey.createdAt,
    };
  }

  async findAll(userId: number) {
    const keys = await this.apiKeyRepository.find({ where: { userId } });
    return keys.map(k => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      permissions: k.permissions,
      active: k.active,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }));
  }

  async validate(key: string): Promise<{ valid: boolean; userId?: number; permissions?: string[] }> {
    if (!key.startsWith('cpk_')) {
      return { valid: false };
    }

    const plainKey = key.replace('cpk_', '');
    const hashedKey = createHash('sha256').update(plainKey).digest('hex');

    const apiKey = await this.apiKeyRepository.findOne({
      where: { hashedKey, active: true },
    });

    if (!apiKey) {
      return { valid: false };
    }

    // Update last used
    apiKey.lastUsedAt = new Date();
    await this.apiKeyRepository.save(apiKey);

    return {
      valid: true,
      userId: apiKey.userId,
      permissions: apiKey.permissions,
    };
  }

  async revoke(id: number, userId: number) {
    const apiKey = await this.apiKeyRepository.findOne({ where: { id, userId } });
    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }
    apiKey.active = false;
    return this.apiKeyRepository.save(apiKey);
  }

  async delete(id: number, userId: number) {
    const apiKey = await this.apiKeyRepository.findOne({ where: { id, userId } });
    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }
    await this.apiKeyRepository.remove(apiKey);
    return { deleted: true };
  }
}
