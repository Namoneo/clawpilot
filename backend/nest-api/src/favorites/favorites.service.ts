import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async create(userId: number, data: { itemId: number; type: string; name: string }) {
    const existing = await this.favoriteRepository.findOne({
      where: { userId, itemId: data.itemId, type: data.type },
    });
    if (existing) return existing;

    const favorite = this.favoriteRepository.create({
      ...data,
      userId,
    });
    return this.favoriteRepository.save(favorite);
  }

  async findAll(userId: number, type?: string) {
    const where: any = { userId };
    if (type) where.type = type;
    return this.favoriteRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async remove(id: number, userId: number) {
    const favorite = await this.favoriteRepository.findOne({
      where: { id, userId },
    });
    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }
    await this.favoriteRepository.remove(favorite);
    return { deleted: true };
  }

  async check(userId: number, itemId: number, type: string): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, itemId, type },
    });
    return !!favorite;
  }
}
