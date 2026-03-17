import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SlackDiscordService } from './slack-discord.service';
import { IntegrationType } from './entities/slack-discord-integration.entity';

@Controller('integrations')
@UseGuards(AuthGuard('jwt'))
export class SlackDiscordController {
  constructor(private sdService: SlackDiscordService) {}

  @Get('slack-discord')
  findAll(@Request() req) {
    return this.sdService.findByUser(req.user.id);
  }

  @Post('slack-discord')
  create(
    @Request() req,
    @Body() body: {
      type: 'slack' | 'discord';
      webhookUrl: string;
      events: string[];
      channelName?: string;
    },
  ) {
    return this.sdService.create(
      req.user.id,
      body.type === 'slack' ? IntegrationType.SLACK : IntegrationType.DISCORD,
      body.webhookUrl,
      body.events,
      body.channelName,
    );
  }

  @Delete('slack-discord/:id')
  delete(@Param('id') id: string, @Request() req) {
    return this.sdService.delete(parseInt(id, 10), req.user.id);
  }
}
