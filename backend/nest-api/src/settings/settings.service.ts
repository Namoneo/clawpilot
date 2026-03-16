import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private settingRepository: Repository<SystemSetting>,
  ) {}

  async get(key: string): Promise<string | null> {
    const setting = await this.settingRepository.findOne({ where: { key } });
    return setting?.value || null;
  }

  async set(key: string, value: string, description?: string): Promise<SystemSetting> {
    let setting = await this.settingRepository.findOne({ where: { key } });
    
    if (setting) {
      setting.value = value;
    } else {
      setting = this.settingRepository.create({ key, value, description });
    }
    
    return this.settingRepository.save(setting);
  }

  async getAll(): Promise<Record<string, string>> {
    const settings = await this.settingRepository.find();
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }

  async delete(key: string): Promise<void> {
    await this.settingRepository.delete({ key });
  }

  // Predefined settings
  async getPublicSettings() {
    return {
      allowRegistration: (await this.get('allowRegistration')) || 'true',
      requireEmailVerification: (await this.get('requireEmailVerification')) || 'false',
      defaultPlan: (await this.get('defaultPlan')) || 'free',
      supportEmail: (await this.get('supportEmail')) || 'support@clawpilot.com',
    };
  }
}
