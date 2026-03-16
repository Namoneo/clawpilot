import { Injectable } from '@nestjs/common';

export interface AppConfig {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  redis: {
    host: string;
    port: number;
  };
  openrouter: {
    apiKey: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  rateLimit: {
    short: { ttl: number; limit: number };
    medium: { ttl: number; limit: number };
    long: { ttl: number; limit: number };
  };
}

@Injectable()
export class ConfigService {
  private config: AppConfig = {
    port: parseInt(process.env.PORT || '3000'),
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      name: process.env.DB_NAME || 'clawpilot',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'clawpilot-secret-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    rateLimit: {
      short: { ttl: 1000, limit: 3 },
      medium: { ttl: 10000, limit: 20 },
      long: { ttl: 60000, limit: 100 },
    },
  };

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  getAll(): AppConfig {
    return this.config;
  }

  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
}
