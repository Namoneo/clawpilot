import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('public')
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getAll() {
    return this.settingsService.getAll();
  }

  @Get(':key')
  @UseGuards(AuthGuard('jwt'))
  get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Post(':key')
  @UseGuards(AuthGuard('jwt'))
  set(@Param('key') key: string, @Body() body: { value: string; description?: string }) {
    return this.settingsService.set(key, body.value, body.description);
  }

  @Delete(':key')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('key') key: string) {
    return this.settingsService.delete(key);
  }
}
