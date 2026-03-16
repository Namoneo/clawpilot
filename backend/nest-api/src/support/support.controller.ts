import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SupportService } from './support.service';

@Controller('support')
@UseGuards(AuthGuard('jwt'))
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Get()
  findAll(@Request() req, @Query() query: any) {
    return this.supportService.findAll(req.user.id, query);
  }

  @Post()
  create(
    @Request() req,
    @Body() body: { subject: string; description: string; priority: string; category: string },
  ) {
    return this.supportService.create(req.user.id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @Request() req) {
    return this.supportService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Request() req, @Body() body: any) {
    return this.supportService.update(id, req.user.id, body);
  }

  @Patch(':id/close')
  close(@Param('id') id: number, @Request() req) {
    return this.supportService.close(id, req.user.id);
  }
}
