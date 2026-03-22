import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationSettingsService } from './notification-settings.service';

@Controller('notifications/settings')
@UseGuards(AuthGuard('jwt'))
export class NotificationSettingsController {
  constructor(private settingsService: NotificationSettingsService) {}

  @Get()
  getSettings(@Request() req) {
    return this.settingsService.getSettings(req.user.id);
  }

  @Patch()
  updateSetting(
    @Request() req,
    @Body() body: { type: string; event: string; enabled: boolean },
  ) {
    return this.settingsService.updateSetting(
      req.user.id,
      body.type,
      body.event,
      body.enabled,
    );
  }
}
