import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: NestMailerService) {}

  async sendWelcome(email: string, name: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to ClawPilot!',
        html: `
          <h1>Welcome to ClawPilot, ${name}!</h1>
          <p>Get started by creating your first AI agent.</p>
          <a href="https://clawpilot.com/dashboard">Go to Dashboard</a>
        `,
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error}`);
    }
  }

  async sendPasswordReset(email: string, resetToken: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset your ClawPilot password',
        html: `
          <h1>Password Reset</h1>
          <p>Click the link below to reset your password:</p>
          <a href="https://clawpilot.com/reset-password?token=${resetToken}">Reset Password</a>
          <p>This link expires in 1 hour.</p>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error}`);
    }
  }

  async sendAgentNotification(email: string, agentName: string, status: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Agent "${agentName}" ${status}`,
        html: `
          <h1>Agent Update</h1>
          <p>Your agent "${agentName}" is now <strong>${status}</strong>.</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send agent notification: ${error}`);
    }
  }

  async sendBillingReceipt(email: string, amount: number, plan: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `ClawPilot Receipt - ${plan} Plan`,
        html: `
          <h1>Thank you for your payment!</h1>
          <p>Amount: $${amount}</p>
          <p>Plan: ${plan}</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send billing receipt: ${error}`);
    }
  }
}
