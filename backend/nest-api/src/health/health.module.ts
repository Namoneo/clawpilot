import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { Agent } from '../agents/entities/agent.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, User])],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
