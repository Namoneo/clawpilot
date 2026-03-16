import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async create(userId: number, data: {
    name: string;
    content: string;
    type: string;
    metadata?: Record<string, any>;
  }) {
    const document = this.documentRepository.create({
      ...data,
      userId,
      status: 'pending',
    });
    return this.documentRepository.save(document);
  }

  async findAll(userId: number, options: { page?: number; limit?: number; type?: string } = {}) {
    const { page = 1, limit = 20, type } = options;
    
    const where: any = { userId };
    if (type) where.type = type;

    const [documents, total] = await this.documentRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: documents,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number, userId: number) {
    const document = await this.documentRepository.findOne({
      where: { id, userId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async update(id: number, userId: number, data: Partial<Document>) {
    const document = await this.findOne(id, userId);
    Object.assign(document, data);
    return this.documentRepository.save(document);
  }

  async remove(id: number, userId: number) {
    const document = await this.findOne(id, userId);
    await this.documentRepository.remove(document);
    return { deleted: true };
  }

  async search(userId: number, query: string) {
    return this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.userId = :userId', { userId })
      .andWhere('(doc.name ILIKE :query OR doc.content ILIKE :query)', {
        query: `%${query}%`,
      })
      .limit(10)
      .getMany();
  }

  async getStats(userId: number) {
    const total = await this.documentRepository.count({ where: { userId } });
    const byType = await this.documentRepository
      .createQueryBuilder('doc')
      .select('doc.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('doc.userId = :userId', { userId })
      .groupBy('doc.type')
      .getRawMany();

    return { total, byType };
  }
}
