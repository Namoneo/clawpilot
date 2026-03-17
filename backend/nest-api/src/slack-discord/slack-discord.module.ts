import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackDiscordService } from './slack-discord.service';
import { SlackDiscordController } from './slack-discord.controller';
import { SlackDiscordIntegration } from './entities/slack-discord-integration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SlackDiscordIntegration])],
  controllers: [SlackDiscordController],
  providers: [SlackDiscordService],
  exports: [SlackDiscordService],
})
export class SlackDiscordModule {}
