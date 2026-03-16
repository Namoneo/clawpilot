import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly uploadDir = process.env.UPLOAD_DIR || '/tmp/clawpilot/uploads';

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Buffer, filename: string, folder: string = 'uploads'): Promise<UploadResult> {
    const key = `${folder}/${Date.now()}-${filename}`;
    const filepath = path.join(this.uploadDir, key);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, file);
    
    this.logger.log(`File uploaded: ${key}`);
    
    return {
      url: `/storage/${key}`,
      key,
      size: file.length,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    const filepath = path.join(this.uploadDir, key);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      this.logger.log(`File deleted: ${key}`);
      return true;
    }
    
    return false;
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // Simplified - in production use actual S3 or cloud storage
    return `/storage/${key}?expires=${Date.now() + expiresIn * 1000}`;
  }

  getPublicUrl(key: string): string {
    return `/storage/${key}`;
  }
}
