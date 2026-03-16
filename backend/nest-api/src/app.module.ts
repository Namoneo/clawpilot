import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AgentsModule } from './agents/agents.module';
import { User } from './auth/entities/user.entity';
import { Agent } from './agents/entities/agent.entity';
import { AgentRun } from './agents/entities/agent-run.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'clawpilot',
      entities: [User, Agent, AgentRun],
      synchronize: true, // Disable in production
    }),
    AuthModule,
    AgentsModule,
  ],
})
export class AppModule {}
