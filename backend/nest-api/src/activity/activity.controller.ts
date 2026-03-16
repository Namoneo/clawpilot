import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivityService } from './activity.service';

@Controller('activity')
@UseGuards(AuthGuard('jwt'))
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get()
  findAll(@Request() req, @Query() query: any) {
    return this.activityService.findAll(req.user.id, query);
  }

  @Get('recent')
  getRecent(@Request() req, @Query('limit') limit?: string) {
    return this.activityService.getRecent(req.user.id, limit ? parseInt(limit) : 10);
  }

  @Get('unread')
  getUnreadCount(@Request() req) {
    return this.activityService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: number, @Request() req) {
    return this.activityService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req) {
    return this.activityService.markAllAsRead(req.user.id);
  }
}
