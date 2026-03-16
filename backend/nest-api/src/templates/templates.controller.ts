import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TemplatesService } from './templates.service';

@Controller('templates')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const template = this.templatesService.findOne(id);
    if (!template) {
      return { error: 'Template not found' };
    }
    return template;
  }

  @Get('routing/default')
  getDefaultRouting() {
    return this.templatesService.getDefaultRouting();
  }
}
