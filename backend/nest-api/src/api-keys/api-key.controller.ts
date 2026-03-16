import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeyService } from './api-key.service';

@Controller('api-keys')
@UseGuards(AuthGuard('jwt'))
export class ApiKeyController {
  constructor(private apiKeyService: ApiKeyService) {}

  @Post()
  create(
    @Request() req,
    @Body() body: { name: string; permissions?: string[]; expiresAt?: string },
  ) {
    return this.apiKeyService.create(
      req.user.id,
      body.name,
      body.permissions,
      body.expiresAt ? new Date(body.expiresAt) : undefined,
    );
  }

  @Get()
  findAll(@Request() req) {
    return this.apiKeyService.findByUser(req.user.id);
  }

  @Delete(':id')
  revoke(@Param('id') id: string, @Request() req) {
    return this.apiKeyService.revoke(parseInt(id, 10), req.user.id);
  }
}
