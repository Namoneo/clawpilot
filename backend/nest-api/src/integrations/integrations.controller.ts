import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
@UseGuards(AuthGuard('jwt'))
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get('types')
  getTypes() {
    return this.integrationsService.getIntegrationTypes();
  }

  @Get()
  findAll(@Request() req) {
    return this.integrationsService.findAll(req.user.id);
  }

  @Post()
  create(
    @Request() req,
    @Body() body: { type: string; credentials: Record<string, any> },
  ) {
    return this.integrationsService.create(req.user.id, body.type as any, body.credentials);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @Request() req) {
    return this.integrationsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Request() req,
    @Body() body: any,
  ) {
    return this.integrationsService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Request() req) {
    return this.integrationsService.remove(id, req.user.id);
  }

  @Patch(':id/toggle')
  toggle(
    @Param('id') id: number,
    @Request() req,
    @Body() body: { active: boolean },
  ) {
    return this.integrationsService.toggle(id, req.user.id, body.active);
  }
}
