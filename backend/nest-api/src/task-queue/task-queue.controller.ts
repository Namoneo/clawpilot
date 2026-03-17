import { Controller, Get, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TaskQueueService } from './task-queue.service';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TaskQueueController {
  constructor(private taskQueueService: TaskQueueService) {}

  @Get('stats')
  getStats() {
    return this.taskQueueService.getQueueStats();
  }

  @Post('email')
  sendEmail(
    @Request() req,
    @Body() body: { to: string; subject: string; template: string },
  ) {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return this.taskQueueService.sendEmail(
      body.to,
      body.subject,
      body.template,
      { userId: req.user.id },
    );
  }

  @Post('webhook')
  triggerWebhook(
    @Request() req,
    @Body() body: { url: string; event: string; payload: unknown },
  ) {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return this.taskQueueService.triggerWebhook(
      body.url,
      body.event,
      body.payload,
    );
  }
}
