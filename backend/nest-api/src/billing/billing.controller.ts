import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BillingService, Plan } from './billing.service';

@Controller('billing')
@UseGuards(AuthGuard('jwt'))
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get()
  async getBilling(@Request() req) {
    return this.billingService.getPlan(req.user.id);
  }

  @Get('usage')
  async getUsage(@Request() req) {
    return this.billingService.getUsage(req.user.id);
  }

  @Get('plans')
  getPlans() {
    return this.billingService.getPlans();
  }

  @Post('upgrade')
  async upgrade(@Request() req, @Body('plan') plan: string) {
    return this.billingService.upgradePlan(req.user.id, plan as Plan);
  }

  @Post('webhook')
  async stripeWebhook(@Body() body: any) {
    // Handle Stripe webhooks
    // In production, verify signature and process events
    return { received: true };
  }
}
