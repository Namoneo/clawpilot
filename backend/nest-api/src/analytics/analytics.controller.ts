import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('tokens-over-time')
  getTokenUsageOverTime(@Request() req, @Query('days') days?: string) {
    return this.analyticsService.getTokenUsageOverTime(req.user.id, days ? parseInt(days) : 30);
  }

  @Get('duration-distribution')
  getRunDurationDistribution(@Request() req) {
    return this.analyticsService.getRunDurationDistribution(req.user.id);
  }

  @Get('success-failure')
  getSuccessFailureRate(@Request() req) {
    return this.analyticsService.getSuccessFailureRate(req.user.id);
  }

  @Get('top-agents')
  getTopAgentsByRuns(@Request() req, @Query('limit') limit?: string) {
    return this.analyticsService.getTopAgentsByRuns(req.user.id, limit ? parseInt(limit) : 5);
  }

  @Get('average-tokens')
  getAverageTokensPerRun(@Request() req) {
    return { average: await this.analyticsService.getAverageTokensPerRun(req.user.id) };
  }
}
