import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
@UseGuards(AuthGuard('jwt'))
export class SchedulerController {
  constructor(private schedulerService: SchedulerService) {}

  @Get()
  findAll(@Request() req) {
    return this.schedulerService.findAll(req.user.id);
  }

  @Post()
  create(
    @Request() req,
    @Body() body: { name: string; agentId: number; cronExpression: string; enabled: boolean },
  ) {
    return this.schedulerService.create(req.user.id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @Request() req) {
    return this.schedulerService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Request() req, @Body() body: any) {
    return this.schedulerService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Request() req) {
    return this.schedulerService.remove(id, req.user.id);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: number, @Request() req, @Body() body: { enabled: boolean }) {
    return this.schedulerService.toggle(id, req.user.id, body.enabled);
  }
}
