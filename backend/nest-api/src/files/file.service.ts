import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { Multer } from 'multer';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  async upload(file: Multer.File, userId: number, agentId?: number, description?: string): Promise<File> {
    const newFile = this.fileRepository.create({
      userId,
      originalName: file.originalname,
      storedName: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
      agentId,
      description,
    });
    return this.fileRepository.save(newFile);
  }

  async findByUser(userId: number): Promise<File[]> {
    return this.fileRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async delete(id: number, userId: number): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id, userId } });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    
    // Delete physical file
    const fs = require('fs');
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    await this.fileRepository.remove(file);
  }
}
