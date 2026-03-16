import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
@UseGuards(AuthGuard('jwt'))
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Get()
  findAll(@Request() req) {
    return this.webhooksService.findAll(req.user.id);
  }

  @Post()
  create(
    @Request() req,
    @Body() body: { url: string; events: string[]; secret: string },
  ) {
    return this.webhooksService.create(req.user.id, body.url, body.events, body.secret);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @Request() req) {
    return this.webhooksService.findOne(id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Request() req) {
    return this.webhooksService.remove(id, req.user.id);
  }

  @Patch(':id/toggle')
  toggle(
    @Param('id') id: number,
    @Request() req,
    @Body() body: { active: boolean },
  ) {
    return this.webhooksService.toggle(id, req.user.id, body.active);
  }
}
