import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Request() req) {
    return this.apiKeysService.findAll(req.user.id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() body: { name: string; permissions: string[] }) {
    return this.apiKeysService.create(req.user.id, body.name, body.permissions);
  }

  @Post(':id/revoke')
  @UseGuards(AuthGuard('jwt'))
  revoke(@Param('id') id: number, @Request() req) {
    return this.apiKeysService.revoke(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id') id: number, @Request() req) {
    return this.apiKeysService.delete(id, req.user.id);
  }
}
