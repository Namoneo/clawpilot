import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AlertsService } from './alerts.service';

@Controller('alerts')
@UseGuards(AuthGuard('jwt'))
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  findAll(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('unread') unread?: string,
  ) {
    return this.alertsService.findAll(req.user.id, {
      limit: limit ? parseInt(limit) : 50,
      unread: unread === 'true',
    });
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.alertsService.getUnreadCount(req.user.id);
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: number, @Request() req) {
    return this.alertsService.markAsRead(id, req.user.id);
  }

  @Post('read-all')
  markAllAsRead(@Request() req) {
    return this.alertsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: number, @Request() req) {
    return this.alertsService.delete(id, req.user.id);
  }
}
