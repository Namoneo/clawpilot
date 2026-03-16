import { Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsageService } from './usage.service';

@Controller('usage')
@UseGuards(AuthGuard('jwt'))
export class UsageController {
  constructor(private usageService: UsageService) {}

  @Get()
  async getUsage(
    @Request() req,
    @Query('type') type: string,
    @Query('days') days?: string,
  ) {
    return this.usageService.getUsage(req.user.id, type, days ? parseInt(days) : 30);
  }

  @Get('check')
  async checkLimit(
    @Request() req,
    @Query('type') type: string,
    @Query('plan') plan?: string,
  ) {
    return this.usageService.checkLimit(req.user.id, type, plan || 'free');
  }

  @Get('total')
  async getTotal(@Request() req, @Query('type') type: string) {
    const total = await this.usageService.getTotalUsage(req.user.id, type);
    return { type, total };
  }
}
