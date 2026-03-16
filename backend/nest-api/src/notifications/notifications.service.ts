import { Injectable, Logger } from '@nestjs/common';

export interface Notification {
  userId: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async send(userId: number, notification: Omit<Notification, 'userId'>) {
    this.logger.log(`Sending notification to user ${userId}: ${notification.title}`);
    // In production, save to database and emit via WebSocket
    return { sent: true, ...notification };
  }

  async sendBatch(notifications: Notification[]) {
    const results = await Promise.all(
      notifications.map(n => this.send(n.userId, { type: n.type, title: n.title, message: n.message, data: n.data }))
    );
    return { sent: results.length };
  }

  async notifyAgentStarted(userId: number, agentName: string) {
    return this.send(userId, {
      type: 'success',
      title: 'Agent Started',
      message: `Agent "${agentName}" is now running`,
    });
  }

  async notifyAgentStopped(userId: number, agentName: string) {
    return this.send(userId, {
      type: 'info',
      title: 'Agent Stopped',
      message: `Agent "${agentName}" has been stopped`,
    });
  }

  async notifyAgentFailed(userId: number, agentName: string, error: string) {
    return this.send(userId, {
      type: 'error',
      title: 'Agent Failed',
      message: `Agent "${agentName}" failed: ${error}`,
    });
  }

  async notifyBilling(userId: number, message: string) {
    return this.send(userId, {
      type: 'warning',
      title: 'Billing Update',
      message,
    });
  }
}
