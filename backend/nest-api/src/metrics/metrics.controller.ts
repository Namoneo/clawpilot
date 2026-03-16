import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MetricsService } from './metrics.service';

@Controller('metrics')
@UseGuards(AuthGuard('jwt'))
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  async getMetrics() {
    return this.metricsService.getMetrics();
  }

  @Get('daily')
  async getDailyMetrics(@Query('days') days: string) {
    return this.metricsService.getDailyMetrics(days ? parseInt(days) : 7);
  }

  @Get('agent/:id')
  async getAgentMetrics(@Request() req, @Query('id') id: string) {
    return this.metricsService.getAgentMetrics(parseInt(id));
  }
}
