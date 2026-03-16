import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [AgentsModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
