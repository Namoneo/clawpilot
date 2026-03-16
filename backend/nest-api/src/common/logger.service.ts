import { Logger, LoggerService, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private logger = new Logger('ClawPilot');

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, context);
  }

  // Custom loggers for specific contexts
  agent(agentId: number, message: string) {
    this.logger.log(`[Agent ${agentId}] ${message}`, 'Agent');
  }

  user(userId: number, action: string) {
    this.logger.log(`[User ${userId}] ${action}`, 'User');
  }

  api(endpoint: string, method: string, statusCode: number, duration: number) {
    this.logger.log(`${method} ${endpoint} ${statusCode} - ${duration}ms`, 'API');
  }

  webhook(event: string, status: 'success' | 'error') {
    const emoji = status === 'success' ? '✅' : '❌';
    this.logger.log(`${emoji} Webhook ${event}: ${status}`, 'Webhook');
  }

  billing(userId: number, event: string, amount?: number) {
    this.logger.log(`[Billing] User ${userId}: ${event}${amount ? ` - $${amount}` : ''}`, 'Billing');
  }

  security(event: string, details: string) {
    this.logger.warn(`[SECURITY] ${event}: ${details}`, 'Security');
  }
}
