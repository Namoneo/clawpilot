import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSetting } from './entities/notification-setting.entity';

@Injectable()
export class NotificationSettingsService {
  constructor(
    @InjectRepository(NotificationSetting)
    private settingRepository: Repository<NotificationSetting>,
  ) {}

  async getSettings(userId: number) {
    let settings = await this.settingRepository.find({ where: { userId } });
    
    // Create defaults if not exist
    if (settings.length === 0) {
      const defaults = [
        // email type
        { userId, type: 'email', event: 'agent_started', enabled: true },
        { userId, type: 'email', event: 'agent_stopped', enabled: true },
        { userId, type: 'email', event: 'agent_failed', enabled: true },
        { userId, type: 'email', event: 'billing', enabled: true },
        // push type
        { userId, type: 'push', event: 'agent_started', enabled: false },
        { userId, type: 'push', event: 'agent_stopped', enabled: false },
        { userId, type: 'push', event: 'agent_failed', enabled: false },
        { userId, type: 'push', event: 'billing', enabled: false },
        // webhook type
        { userId, type: 'webhook', event: 'agent_started', enabled: false },
        { userId, type: 'webhook', event: 'agent_stopped', enabled: false },
        { userId, type: 'webhook', event: 'agent_failed', enabled: false },
        { userId, type: 'webhook', event: 'billing', enabled: false },
      ];
      
      for (const s of defaults) {
        await this.settingRepository.save(this.settingRepository.create(s));
      }
      settings = await this.settingRepository.find({ where: { userId } });
    }
    
    return settings;
  }

  async updateSetting(userId: number, type: string, event: string, enabled: boolean) {
    let setting = await this.settingRepository.findOne({
      where: { userId, type, event },
    });
    
    if (!setting) {
      setting = this.settingRepository.create({ userId, type, event, enabled });
    } else {
      setting.enabled = enabled;
    }
    
    return this.settingRepository.save(setting);
  }
}
